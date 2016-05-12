import React from "react";
import Clade from "./Clade.jsx";
import Genomes from "./canvas/Genomes.jsx";
import {visibleLeafNodes} from "./util/visibleLeafNodes";

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
    const globalSelectionDefined = !_.isUndefined(selectionObj.select);

    if (_.isNumber(idxA) && _.isNumber(idxB)) {
      const start = Math.min(idxA, idxB);
      const end = Math.max(idxA, idxB);
      const selectedIds = _.clone(this.state.selection) || {};
      const regionBins = _.keyBy(selectionObj.region._bins, 'idx');

      for (let i = start; i <= end; i++) {
        const curSelection = selectedIds[i];

        // if the selection obj says what the new state is, use it. Otherwise toggle existing state.
        const newSelectionState = globalSelectionDefined ? selectionObj.select : !curSelection;

        if (newSelectionState) {
          selectedIds[i] = regionBins[i];
        }
        else {
          delete selectedIds[i];
        }
      }
      return selectedIds;
    }
  }

  handleHighlight(highlight) {
    console.log(highlight);
    this.possiblyHandleSelection(highlight);
    this.setState({highlight: highlight});
    if (this.props.onHighlight) this.props.onHighlight(highlight);
  }

  possiblyHandleSelection(newHighlight) {
    const sel = this.state.inProgressSelection;

    if (_.isEmpty(sel) ||
        _.isEmpty(newHighlight) || !sel.genome || !sel.region || !newHighlight.genome) {
      return;
    }

    if (!newHighlight.region ||
        newHighlight.genome.taxon_id !== sel.genome.taxon_id) {
      // either no region highlighted (e.g. focus on a tree node),
      // or if the genome differs,
      //   => cancel selection.
      this.setState({inProgressSelection: undefined});
      return;
    }

    const hlFirstBin = newHighlight.region.firstBin();
    const selFirstBin = sel.region.firstBin();

    if (hlFirstBin.idx !== selFirstBin.idx) {
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
    const style = { minWidth: mtx.width.vis };

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