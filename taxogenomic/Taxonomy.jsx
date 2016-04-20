import React from "react";
import Clade from "./Clade.jsx";

export default class Taxonomy extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      inProgressSelection: {},
      selection: {},
      highlight: {}
    };
  }

  handleSelectionStart(selection) {
    this.setState({inProgressSelection: selection});
  }

  handleSelection(selection) {
    const newSelection = this.updateSelection(selection);
    if(newSelection) {
      this.setState({selection: newSelection});
      if (this.props.onSelection) this.props.onSelection(selection);
    }
  }

  updateSelection(selectionObj) {
    const idxA = _.get(selectionObj, 'binFrom.idx');
    const idxB = _.get(selectionObj, 'binTo.idx');

    if (_.isNumber(idxA) && _.isNumber(idxB)) {
      const start = Math.min(idxA, idxB);
      const end = Math.max(idxA, idxB);
      const selectedIds = _.clone(this.state.selection);
      const regionBins = _.keyBy(selectionObj.region._bins, 'idx');

      for (let i = start; i <= end; i++) {
        const curSelection = selectedIds[i];
        if (curSelection) {
          delete selectedIds[i];
        }
        else {
          selectedIds[i] = regionBins[i];
        }
      }
      return selectedIds;
    }
  }

  handleHighlight(highlight) {
    this.setState({highlight: highlight});
    if (this.props.onHighlight) this.props.onHighlight(highlight);
  }

  render() {
    const propsPassthrough = _.pick(this.props, [
      'nodeDisplayInfo',
      'svgMetrics'
    ]);

    return (
      <g className="taxonomy">
        <Clade node={this.props.rootNode}
               isRoot={true}
               state={this.state}
               onSelectionStart={this.handleSelectionStart.bind(this)}
               onSelection={this.handleSelection.bind(this)}
               onHighlight={this.handleHighlight.bind(this)}
          {...propsPassthrough} />
      </g>
    )
  }
}

Taxonomy.propTypes = {
  rootNode: React.PropTypes.object.isRequired,
  nodeDisplayInfo: React.PropTypes.object.isRequired,
  svgMetrics: React.PropTypes.object.isRequired,

  onSelection: React.PropTypes.func,
  onHighlight: React.PropTypes.func
};