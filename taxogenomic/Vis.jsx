import React from "react";
import ReactDOM from 'react-dom';
import _ from "lodash";
import layoutNodes from "./util/layout";
import visibleLeafCount from "./util/visibleLeafCount";
import svgMetrics from './util/svgMetrics';
import Taxonomy from "./Taxonomy.jsx";

const EUKARYOTA = 2759;
const windowResizeDebounceMs = 250;

export default class Vis extends React.Component {
  constructor(props) {
    super(props);
    this.updateResultsCount(props);
    this.state = {
      nodeDisplayInfo: this.initNodeState(props.taxonomy),
      rootNodeId: EUKARYOTA
    };
    
    if(!_.isUndefined(global.addEventListener)) {
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

  componentDidUnmount() {
    if(this.resizeListener) {
      global.removeEventListener('resize', this.resizeListener);
    }
  }

  updateAvailableWidth() {
    const parentWidth = ReactDOM.findDOMNode(this).parentNode.clientWidth;
    const newMetrics = svgMetrics(parentWidth);
    console.log('width is', parentWidth, 'metrics are', newMetrics);
    if(this.didMetricsUpdate(newMetrics)) {
      this.setState({
        metrics: newMetrics,
        nodeDisplayInfo: this.updateTaxonomyDisplayInfo(this.props, newMetrics)
      });
    }
  }

  componentWillReceiveProps(newProps) {
    if(this.didResultsChange(newProps)) {
      const newDisplayInfo = this.updateTaxonomyDisplayInfo(newProps);
      if(newDisplayInfo) this.setState({nodeDisplayInfo: newDisplayInfo});
    }
  }

  updateTaxonomyDisplayInfo(props = this.props, metrics = this.state.metrics) {
    if(metrics) {
      const newDisplayInfo = layoutNodes(
        _.get(metrics, 'width.speciesTree'), // speciesTreeWidth,
        this.height(metrics),
        props.taxonomy,
        this.state.nodeDisplayInfo,
        this.state.rootNodeId
      );

      return newDisplayInfo;
    }
    else {
      console.log("Did not update taxonomy display info because no svg metrics available");
    }
  }

  initNodeState(taxonomy = this.props.taxonomy) {
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
    // only re-render this component if the results changed.
    const decision = this.didResultsChange(newProps) || this.didMetricsUpdate(newState.metrics);
    this.updateResultsCount(newProps);
    return decision;
  }

  didMetricsUpdate(newMetrics) {
    return !_.isEqual(this.state.metrics, newMetrics);
  }

  rootNode() {
    return this.props.taxonomy.indices.id[this.state.rootNodeId];
  }

  height(metrics = this.state.metrics) {
    if(!metrics) throw new Error("No svg metrics available for call to height()");
    return visibleLeafCount(this.props.taxonomy, this.state.nodeDisplayInfo) * metrics.height.leafNode;
  }

  width() {
    if(!this.state.metrics) throw new Error("No svg metrics available for call to width()");
    return this.state.metrics.width.vis;
  }

  margin() {
    return 10;
  }

  marginTransform() {
    const m = this.margin() / 2;
    return `translate(${m},${m})`;
  }

  renderSvg() {
    if(this.state.metrics) {
      return (
        <svg width={this.width() + this.margin()}
             height={this.height() + this.margin()}>
          <g className="margin" transform={this.marginTransform()}>
            <Taxonomy rootNode={this.rootNode()}
                      nodeDisplayInfo={this.state.nodeDisplayInfo}
                      onHighlight={this.props.onHighlight}
                      onSelection={this.props.onSelection}
                      svgMetrics={this.state.metrics} />
          </g>
        </svg>
      );
    }
  }

  render() {
    return (
      <div className="taxogenomic-vis">
        {this.renderSvg()}
      </div>
    )
  }
}

Vis.propTypes = {
  parentWidth: React.PropTypes.number,
  
  taxonomy: React.PropTypes.object.isRequired,

  onSelection: React.PropTypes.func,
  onHighlight: React.PropTypes.func
};