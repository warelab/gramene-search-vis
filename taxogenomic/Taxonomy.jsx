import React from "react";
import Clade from "./Clade.jsx";

export default class Taxonomy extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      inProgressSelection: undefined,
      selection: undefined,
      highlight: undefined
    }
  }

  handleSelectionStart(selection) {
    console.log('selection start', selection);
    this.setState({inProgressSelection: selection});
  }

  handleSelection(selection) {
    console.log('selection done', selection);
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
    const idxA = _.get(selectionObj, 'binFrom.idx');
    const idxB = _.get(selectionObj, 'binTo.idx');

    if (_.isNumber(idxA) && _.isNumber(idxB)) {
      const start = Math.min(idxA, idxB);
      const end = Math.max(idxA, idxB);
      const selectedIds = _.clone(this.state.selection) || {};
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
    this.possiblyHandleSelection(highlight);
    this.setState({highlight: highlight});
    if (this.props.onHighlight) this.props.onHighlight(highlight);
  }

  possiblyHandleSelection(newHighlight) {
    console.log('possibly handle selection!');
    const sel = this.state.inProgressSelection;

    if (_.isEmpty(sel) ||
        _.isEmpty(newHighlight) || !sel.genome || !sel.region || !newHighlight.genome) {
      console.log('not doing anything because no selection or highlight or highlight has no genome');
      return;
    }

    if (!newHighlight.region ||
        newHighlight.genome.taxon_id !== sel.genome.taxon_id) {
      // either no region highlighted (e.g. focus on a tree node),
      // or if the genome differs,
      //   => cancel selection.
      this.setState({inProgressSelection: undefined});
      console.log('cancelled in progress selection', sel, newHighlight);
      return;
    }

    const hlFirstBin = newHighlight.region.firstBin();
    const selFirstBin = sel.region.firstBin();

    if (hlFirstBin.idx !== selFirstBin.idx) {
      console.log('completing in progress selection');
      const selection = _.clone(sel);

      // if the region differs,
      //    => decide how to complete the selection:
      //      a. if the highlight region is after the selected region,
      //        => select from selected bin to last bin in selected region.

      if (hlFirstBin.idx > selFirstBin.idx) {
        selection.binTo = selection.region.bin(selection.region.binCount() - 1);
      }

      //      b. if the highlight region is before the selected region,
      //        => seleect from first bin in selected region to selected bin
      else { // hlFirstBin < selFirstBin
        selection.binTo = selection.region.firstBin();
      }

      this.handleSelection(selection);
    }
    else{
      console.log('not doing anything because same region');
    }
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
              {...this.state}
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