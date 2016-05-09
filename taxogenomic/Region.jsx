import React from "react";
import Bin from "./Bin.jsx";
import PropsComparer from "./util/PropsComparer";

export default class Region extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.propsComparer = new PropsComparer(
      'globalStats.timesSetResultsHasBeenCalled',
      'selection',
      'baseWidth',
      'height'
    );
  }

  render() {
    const width = this.props.region.size * this.props.baseWidth;

    return (
      <g className="region" 
         onMouseOut={this.regionLostFocus.bind(this)}>
        <rect x="0"
              y="0"
              className={this.regionClassName()}
              width={width}
              height={this.props.height}
              fill={this.props.color}
              onClick={this.handleRegionSelection.bind(this)}
              onMouseOver={this.handleRegionHighlight.bind(this)}
        />
        {this.renderBins()}
      </g>
    );
  }

  regionClassName() {
    const isSelected = !_.isEmpty(this.props.selection) && this.isEntireRegionSelected();

    return 'full-region'
      + (isSelected ? ' selected' : '');
  }

  isEntireRegionSelected() {
    const firstBinIdx = this.props.region.firstBin().idx;
    const binIdxLimit = firstBinIdx + this.props.region.binCount();

    for (let i = firstBinIdx; i < binIdxLimit; i++) {
      if (!this.props.selection[i]) {
        return false;
      }
    }
    return true;
  }

  handleRegionSelection(e) {
    e.stopPropagation();
    const r = this.props.region;
    const binFrom = r.firstBin();
    const binTo = r.bin(r.binCount() - 1);
    this.props.onSelection({
      name: `Selected ${this.props.genome.system_name}:${this.props.region.name}`,
      binFrom: binFrom,
      binTo: binTo,
      region: this.props.region,
      genome: this.props.genome
    })
  }

  handleRegionHighlight(e) {
    e.stopPropagation();
    // console.log("region highlight", this.props.region);
    this.props.onHighlight({
      region: this.props.region,
      genome: this.props.genome,
      name: `${this.props.genome.system_name} ${this.props.region.name} ` +
      `has ${this.props.region.results.count} results`
    });
  }

  handleBinHighlight(bin, e) {
    e.stopPropagation();
    this.setState({hoveredBin: bin});
    if (!this.draggingFromBin()) {
      // console.log("bin highlighthlight", bin, this.props.region);
      this.props.onHighlight({
        bin: bin,
        region: this.props.region,
        genome: this.props.genome,
        name: `${this.props.genome.system_name} ${this.props.region.name}:${bin.start}-${bin.end} has ${bin.results.count} results`
      });
    }
    else {
      // console.log("dragging");
    }
  }

  shouldComponentUpdate(newProps) {
    return this.draggingFromBin() || this.propsComparer.differ(this.props, newProps);
  }

  handleBinSelection(bin, e) {
    e.stopPropagation();
    this.props.onSelection({
      name: `Bin ${bin.idx} on ${this.props.genome.name}:${this.props.region.name}`,
      binFrom: bin,
      binTo: bin,
      region: this.props.region,
      genome: this.props.genome
    });
  }

  handleBinSelectionStart(bin, e) {
    e.stopPropagation();
    console.log("start dragging at", bin.idx);

    this.props.onSelectionStart({
      name: `Selection in progress on ${this.props.genome.name}:${this.props.region.name}`,
      binFrom: bin,
      region: this.props.region,
      genome: this.props.genome
    })
  }

  handleBinSelectionEnd(bin, e) {
    if (e) e.stopPropagation();

    const dragging = this.draggingFromBin();
    if (dragging) {
      console.log("done dragging", dragging.idx, bin.idx);

      this.props.onSelection({
        name: Math.abs(dragging.idx - bin.idx + 1) + ' bins on ' + this.props.genome.name + ':' + this.props.region.name,
        binFrom: dragging,
        binTo: bin,
        region: this.props.region,
        genome: this.props.genome
      });
    }
  }

  draggingFromBin() {
    const sel = this.props.inProgressSelection;
    if (sel && sel.genome && sel.genome.taxon_id === this.props.genome.taxon_id
      && sel.region.firstBin().idx === this.props.region.firstBin().idx) {
      return sel.binFrom;
    }
  }

  handleMouseOut(bin, e) {
    // console.log('bin mouseout', bin, dragging);
    const dragging = this.draggingFromBin();
    if (dragging &&
      dragging.region === bin.region &&
      dragging.taxon_id === bin.taxon_id) {

      console.log('bin mouseout', dragging, this.state.hoveredBin);
      // stopping propagation prevents the Region's onMouseOut handler, regionLostFocus
      // from being called. We don't want to do that if we are dragging and have not strayed to a different region.
      e.stopPropagation();
    }
  }

  regionLostFocus() {
    console.log('focus lost', this.draggingFromBin(), this.state.hoveredBin);
    if (this.draggingFromBin()) {
      this.handleBinSelectionEnd(this.state.hoveredBin);
    }
  }

  renderBins() {
    const binProps = {
      maxScore: this.props.globalStats.bins.max || 1,
      region: this.props.region,
      regionIdx: this.props.regionIdx,
      baseWidth: this.props.baseWidth,
      height: this.props.height,
      onRegionSelect: this.handleRegionSelection.bind(this),
      onBinHighlight: this.handleBinHighlight.bind(this),
      onBinUnhighlight: this.handleMouseOut.bind(this),
      onBinSelectionStart: this.handleBinSelectionStart.bind(this),
      onBinSelectionEnd: this.handleBinSelectionEnd.bind(this)
    };

    return _.filter(this.props.region._bins, (bin)=>bin.results.count)
      .map((bin) => <Bin key={bin.idx}
                         bin={bin}
                         isSelected={this.isBinSelected(bin)}
        {...binProps} />);
  }

  isBinSelected(bin) {
    return this.isInDraggingRange(bin) || this.isInSelection(bin)
  }

  isInDraggingRange(bin) {
    const dragStartBin = this.draggingFromBin();
    const hoveredBin = this.state.hoveredBin;
    if (dragStartBin && hoveredBin) {
      const startIdx = Math.min(dragStartBin.idx, hoveredBin.idx);
      const endIdx = Math.max(dragStartBin.idx, hoveredBin.idx);

      return bin.idx >= startIdx && bin.idx <= endIdx;
    }
  }

  isInSelection(bin) {
    const selected = _.get(this.props, 'selection');
    return selected && !!selected[bin.idx];
  }
}

Region.propTypes = {
  regionIdx: React.PropTypes.number.isRequired,
  region: React.PropTypes.object.isRequired,
  genome: React.PropTypes.object.isRequired,
  highlight: React.PropTypes.object,
  selection: React.PropTypes.object,
  inProgressSelection: React.PropTypes.object,
  onSelectionStart: React.PropTypes.func.isRequired,
  onSelection: React.PropTypes.func.isRequired,
  onHighlight: React.PropTypes.func.isRequired,
  globalStats: React.PropTypes.object.isRequired,
  baseWidth: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  isLastRegion: React.PropTypes.bool.isRequired,
  color: React.PropTypes.string.isRequired
};