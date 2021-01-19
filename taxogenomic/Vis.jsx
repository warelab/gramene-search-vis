import React from "react";
import ReactDOM from "react-dom";
import _ from "lodash";
import layoutNodes from "./util/layout";
import {visibleLeafNodeCount} from "./util/visibleLeafNodes";
import svgMetrics from "./util/svgMetrics";
import Taxonomy from "./Taxonomy.jsx";
import PropsComparer from "./util/PropsComparer";

const windowResizeDebounceMs = 250;

export default class Vis extends React.Component {
  constructor(props) {
    super(props);
    this.updateProps = new PropsComparer('selectedTaxa');
    var rootNode = props.taxonomy;
    while (rootNode.children.length === 1) {
      rootNode = rootNode.children[0];
    }
    this.state = {
      nodeDisplayInfo: this.initNodeState(props.taxonomy, props.selectedTaxa),
      rootNodeId: rootNode.model.id
    };

    if (!_.isUndefined(global.addEventListener)) {
      this.resizeListener = _.debounce(
          this.updateAvailableWidth.bind(this),
          windowResizeDebounceMs
      );

      global.addEventListener('resize', this.resizeListener);
    }
  }

  componentDidMount() {
    this.updateAvailableWidth();
  }

  componentWillUnmount() {
    if (this.resizeListener) {
      global.removeEventListener('resize', this.resizeListener);
    }
  }

  updateAvailableWidth() {
    const parentWidth = ReactDOM.findDOMNode(this).parentNode.clientWidth;
    const newMetrics = svgMetrics(parentWidth);
    console.log('width is', parentWidth, 'metrics are', newMetrics);
    if (this.didMetricsUpdate(newMetrics)) {
      this.setState({
                      metrics: newMetrics,
                      nodeDisplayInfo: this.updateTaxonomyDisplayInfo(this.props, newMetrics)
                    });
    }
  }

  componentWillReceiveProps(newProps) {
    if (this.didResultsChange(newProps) || this.updateProps.differ(this.props, newProps)) {
      const newDisplayInfo = this.updateTaxonomyDisplayInfo(newProps);
      if (newDisplayInfo) this.setState({nodeDisplayInfo: newDisplayInfo});
    }
  }

  updateTaxonomyDisplayInfo(props = this.props, metrics = this.state.metrics) {
    if (metrics) {
      const intermediateDisplayInfo = this.updateNodeExpansionState(props.selectedTaxa);
      const newDisplayInfo = layoutNodes(
          _.get(metrics, 'width.speciesTree'), // speciesTreeWidth,
          this.height(metrics, intermediateDisplayInfo),
          props.taxonomy,
          intermediateDisplayInfo,
          this.state.rootNodeId,
          props.selectedTaxa
      );

      return newDisplayInfo;
    }
    else {
      console.log("Did not update taxonomy display info because no svg metrics available");
    }
  }

  selectedTaxaWithParents(selectedTaxa) {
    const nodeIndex = this.props.taxonomy.indices.id;
    return _.reduce(selectedTaxa, (acc, val, selectedTaxonId) => {
      const selectedNode = nodeIndex[selectedTaxonId];
      const parents = _.reduce(selectedNode.getPath(),
          (acc, parent) => {
            acc[parent.model.id] = true;
            return acc;
          }, {});
      return _.assign(acc, parents);
    }, {});
  }

  updateNodeExpansionState(selectedTaxa) {
    const allSelected = _.size(selectedTaxa) == 0;
    const selectedTaxaWithParents = allSelected ? null : this.selectedTaxaWithParents(selectedTaxa);
    return _.mapValues(this.state.nodeDisplayInfo, (val, key)=> {
          const newVal = _.clone(val);
          newVal.expanded = allSelected || !!selectedTaxaWithParents[key];
          return newVal;
        });
  }
  
  initNodeState(taxonomy) {
    return _(taxonomy.all())
        .keyBy('model.id')
        .mapValues(()=>({expanded: true, highlight: false}))
        .value();
  }

  getSetResultsCallCount(props) {
    return props.taxonomy.globalResultSetStats().timesSetResultsHasBeenCalled;
  }

  didResultsChange(props) {
    const newResultsState = this.getSetResultsCallCount(props);
    return this.genomeResultsState !== newResultsState;
  }

  updateResultsCount(props) {
    this.genomeResultsState = this.getSetResultsCallCount(props);
  }

  shouldComponentUpdate(newProps, newState) {
    const decision = this.didResultsChange(newProps)
        || this.didMetricsUpdate(newState.metrics)
        || this.updateProps.differ(this.props, newProps);
    this.updateResultsCount(newProps);
    return decision;
  }

  didMetricsUpdate(newMetrics) {
    return !_.isEqual(this.state.metrics, newMetrics);
  }

  rootNode() {
    return this.props.taxonomy.indices.id[this.state.rootNodeId];
  }

  height(metrics = this.state.metrics, nodeDisplayInfo = this.state.nodeDisplayInfo) {
    if (!metrics) throw new Error("No svg metrics available for call to height()");
    return visibleLeafNodeCount(this.props.taxonomy, nodeDisplayInfo) * metrics.height.leafNode;
  }

  width() {
    if (!this.state.metrics) throw new Error("No svg metrics available for call to width()");
    return this.state.metrics.width.vis;
  }

  margin() {
    if (!this.state.metrics) throw new Error("No svg metrics available for call to width()");
    return this.state.metrics.layout.margin;
  }

  renderTaxonomy() {
    if (this.state.metrics) {
      return (
          <Taxonomy width={this.width() + this.margin()}
                    height={this.height() + this.margin()}

                    rootNode={this.rootNode()}
                    selectedTaxa={this.props.selectedTaxa}
                    nodeDisplayInfo={this.state.nodeDisplayInfo}
                    onHighlight={this.props.onHighlight}
                    onSelection={this.props.onSelection}
                    svgMetrics={this.state.metrics}/>
      )
    }
  }

  render() {
    return (
        <div className="taxogenomic-vis">
             {this.renderTaxonomy()}
        </div>
    )
  }
}

