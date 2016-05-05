import React from "react";
import {binColor} from "./util/colors";
import transform from "./util/transform";
import PropsComparer from "./util/PropsComparer";

// dragging state is a global state, but using
// the Taxonomy object's state is not working --
// either it's not updated in time or it's being
// blocked in Genome.jsx to prevent excessive
// redrawing. Let's try using a simple variable.
let dragging = undefined;

export default class Region extends React.Component {
  constructor(props) {
    const regionStartBinIdx = props.region.startBin;
    const regionEndBinIdx = props.region.startBin + props.region.binCount() - 1;

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
    const width = (this.props.region.size * this.props.baseWidth);
      // avoid antialiasing artifacts by increasing width by 1px
      // unless it's the last one.
      // + ((this.props.isLastRegion || this.isRegionHighlighted()) ? -1 : 1);


    return (
      <g className="region" onMouseOut={this.regionLostFocus.bind(this)}>
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
      // + (this.isRegionHighlighted() ? ' hovered' : '');
  }

  isRegionHighlighted() {
    const isHighlightedRegion = _.get(this.props.highlight, 'region.startBin')
      === this.props.region.startBin;
    if (isHighlightedRegion) {
      const noBinHighlighted = _.isUndefined(this.props.highlight.bin);
      return noBinHighlighted;
    }

    return false;
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
    if (!dragging) {
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
    return this.propsComparer.differ(this.props, newProps);
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

    dragging = bin;

    this.props.onSelectionStart({
      name: `Selection in progress on ${this.props.genome.name}:${this.props.region.name}`,
      binFrom: bin,
      region: this.props.region,
      genome: this.props.genome
    })
  }

  handleBinSelectionEnd(bin, e) {
    if (e) e.stopPropagation();

    if (dragging) {
      console.log("done dragging", dragging.idx, bin.idx);

      this.props.onSelection({
        name: Math.abs(dragging.idx - bin.idx + 1) + ' bins on ' + this.props.genome.name + ':' + this.props.region.name,
        binFrom: dragging,
        binTo: bin,
        region: this.props.region,
        genome: this.props.genome
      });

      dragging = undefined;
    }
  }

  handleMouseOut(bin, e) {
    // console.log('bin mouseout', bin, dragging);
    if (dragging &&
      dragging.region === bin.region &&
      dragging.taxon_id === bin.taxon_id) {

      // stopping propagation prevents the Region's onMouseOut handler, regionLostFocus
      // from being called. We don't want to do that if we are dragging and have not strayed to a different region.
      e.stopPropagation();
    }
  }

  regionLostFocus() {
    // console.log('focus lost');
    if (dragging) {
      this.handleBinSelectionEnd(this.state.hoveredBin);
    }
    this.setState({
      hoveredBin: undefined
    });
  }

  renderBins() {
    var translateX = 0;
    const maxScore = this.props.globalStats.bins.max || 1;

    return this.props.region.mapBins((bin) => {
      const w = this.props.baseWidth * (bin.end - bin.start + 1);
      const translate = transform(translateX, 0);

      // SIDE EFFECT
      translateX += w;

      if (bin.results.count) {
        const isSelected = this.isBinSelected(bin);
        const score = bin.results.count / maxScore;
        const fillColor = binColor(this.props.regionIdx, score,
          this.props.region.name === 'UNANCHORED');

        const props = {
          key: bin.idx,
          id: `bin${bin.idx}`,
          className: 'bin' + (isSelected ? ' selected' : ''),
          width: w,
          height: this.props.height,
          fill: fillColor,
          // onMouseOver: (e)=>this.handleBinHighlight(bin, e),
          // onMouseOut: (e)=>this.handleMouseOut(bin, e),
          onDoubleClick: (e)=>this.handleRegionSelection(e),
          onClick: (e)=>this.handleBinSelection(bin, e),
          onMouseDown: (e)=>this.handleBinSelectionStart(bin, e),
          onMouseUp: (e)=>this.handleBinSelectionEnd(bin, e)
        };

        return (
          <rect {...props}
            {...translate} />
        );
      }
    });
  }

  isBinSelected(bin) {
    return this.isInDraggingRange(bin) || this.isInSelection(bin)
  }

  isInDraggingRange(bin) {
    const dragStartBin = dragging;
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
  highlight: React.PropTypes.object.isRequired,
  selection: React.PropTypes.object.isRequired,
  onSelectionStart: React.PropTypes.func.isRequired,
  onSelection: React.PropTypes.func.isRequired,
  onHighlight: React.PropTypes.func.isRequired,
  globalStats: React.PropTypes.object.isRequired,
  baseWidth: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  isLastRegion: React.PropTypes.bool.isRequired,
  color: React.PropTypes.string.isRequired
};