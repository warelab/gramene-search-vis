import React from "react";
import Clade from "./Clade.jsx";
import Genomes from "./canvas/Genomes.jsx";
import {visibleLeafNodes} from "./util/visibleLeafNodes";
import {updateSelections} from "./util/selection";
import _ from "lodash";

export default class Taxonomy extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      inProgressSelection: {},
      selections: [],
      highlight: {}
    };
  }

  expandedNodesWillChange(newNodeDisplayInfo) {
    return !_.isEqualWith(
        newNodeDisplayInfo,
        this.props.nodeDisplayInfo,
        (a,b) => a.expanded == b.expanded
    );
  }

  componentWillReceiveProps(newProps) {
    if(this.expandedNodesWillChange(newProps.nodeDisplayInfo)) {
      console.log("Clearing selection state because expanded nodes will change");
      this.setState({selections: []});
    }
  }

  handleSelectionStart(selection) {
    this.setState({inProgressSelection: selection});
  }

  handleSelection(selection) {
    const newSelections = this.updateSelection(selection);
    if (newSelections) {
      this.setState({
        selections: newSelections,
        inProgressSelection: undefined
      });
      if (this.props.onSelection) this.props.onSelection(newSelections);
    }
  }

  updateSelection(selectionObj) {
    return updateSelections(selectionObj, this.state.selections, this.props.rootNode);
  }

  handleHighlight(highlight) {
    this.setState({highlight: highlight});

    if (this.props.onHighlight) {
      // need to expose highlight with modified coordinates, taking into account the x offset
      // caused by the species tree
      const mtx = this.props.svgMetrics;
      const modifiedHighlight = _.cloneDeep(highlight);
      const xOffset = mtx.width.speciesTree + mtx.width.text;
      if (modifiedHighlight.hasOwnProperty('x')) {
        modifiedHighlight.x += xOffset;
        modifiedHighlight.regionDims.x += xOffset;
        this.props.onHighlight(modifiedHighlight);
      }
    }
  }

  marginTransform() {
    const m = this.props.svgMetrics.layout.margin / 2;
    return `translate(${m},${m})`;
  }

  getGenomes(props = this.props) {
    return visibleLeafNodes(props.rootNode, props.nodeDisplayInfo).map((node) => node.model.genome);
  }

  render() {
    const propsPassthrough = _.pick(this.props, [
      'nodeDisplayInfo',
      'svgMetrics'
    ]);

    const mtx = this.props.svgMetrics;
    const svgWidth = mtx.width.speciesTree + mtx.width.text;
    const style = {minWidth: mtx.width.vis};

    return (
        <div className="gramene-search-vis" style={style}>
          <svg width={svgWidth}
               height={this.props.height}>
            <g className="taxonomy" transform={this.marginTransform()}>
              <Clade node={this.props.rootNode}
                     isRoot={true}
                  {...this.state}
                     onSelectionStart={this.handleSelectionStart.bind(this)}
                     onSelection={this.handleSelection.bind(this)}
                     onHighlight={this.handleHighlight.bind(this)}
                  {...propsPassthrough} />
            </g>
          </svg>
          <Genomes genomes={this.getGenomes()}
                   rootNode={this.props.rootNode}
                   globalStats={this.props.rootNode.globalResultSetStats()}
              {...this.state}
                   onSelectionStart={this.handleSelectionStart.bind(this)}
                   onSelection={this.handleSelection.bind(this)}
                   onHighlight={this.handleHighlight.bind(this)}
              {...propsPassthrough} />
        </div>
    )
  }
}

Taxonomy.propTypes = {
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,

  rootNode: React.PropTypes.object.isRequired,
  nodeDisplayInfo: React.PropTypes.object.isRequired,
  svgMetrics: React.PropTypes.object.isRequired,

  onSelection: React.PropTypes.func,
  onHighlight: React.PropTypes.func
};