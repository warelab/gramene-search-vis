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
      selection: { bins: {}, selections: [] },
      highlight: {}
    };
  }

  handleSelectionStart(selection) {
    this.setState({inProgressSelection: selection});
  }

  handleSelection(selection) {
    const newSelection = this.updateSelection(selection);
    if (newSelection) {
      this.setState({
        selection: newSelection,
        inProgressSelection: undefined
      });
      if (this.props.onSelection) this.props.onSelection(newSelection);
    }
  }

  updateSelection(selectionObj) {
    return updateSelections(selectionObj, this.state.selection, this.props.rootNode);
  }

  handleHighlight(highlight) {
    console.log(highlight);
    // this.possiblyHandleSelection(highlight);
    this.setState({highlight: highlight});
    if (this.props.onHighlight) this.props.onHighlight(highlight);
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