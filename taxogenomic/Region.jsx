import React from "react";
import {binColor} from "./util/colors";
import transform from "./util/transform";

// dragging state is a global state, but using
// the Taxonomy object's state is not working --
// either it's not updated in time or it's being
// blocked in Genome.jsx to prevent excessive
// redrawing. Let's try using a simple variable.
let dragging = undefined;

export default class Region extends React.Component {
  constructor(props) {
    super(props);
    this.state = {selectedBins: []};
  }

  render() {
    const width = (this.props.region.size * this.props.baseWidth)
      // avoid antialiasing artifacts by increasing width by 1px
      // unless it's the last one.
      + (this.props.isLastRegion ? 0 : 1);
    return (
      <g className="region" onMouseOut={this.regionLostFocus.bind(this)}>
        <rect x="0"
              y="0"
              className="full-region"
              width={width + 1} // overdraw by 1 px to get around aliasing problem
              height={this.props.height}
              fill={this.props.color}
              onMouseOver={this.handleRegionHighlight.bind(this)}
        />
        {this.renderBins()}
      </g>
    );
  }

  handleRegionHighlight(e) {
    e.stopPropagation();
    console.log("region highlight", this.props.region);
    this.props.onHighlight({region: this.props.region, genome: this.props.genome});
  }

  handleBinHighlight(bin, e) {
    e.stopPropagation();
    this.setState({hoveredBin: bin});
    if (!dragging) {
      console.log("bin highlight", bin, this.props.region);
      this.props.onHighlight({
        bin: bin,
        region: this.props.region,
        genome: this.props.genome
      });
    }
    else {
      console.log("dragging");
    }
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
    console.log('bin mouseout', bin, dragging);
    if (dragging &&
      dragging.region === bin.region &&
      dragging.taxon_id === bin.taxon_id) {

      // stopping propagation prevents the Region's onMouseOut handler, regionLostFocus
      // from being called. We don't want to do that if we are dragging and have not strayed to a different region.
      e.stopPropagation();
    }
  }

  regionLostFocus() {
    console.log('focus lost');
    if (dragging) {
      this.handleBinSelectionEnd(this.state.hoveredBin);
    }
    this.setState({
      hoveredBin: undefined
    });
  }

  renderBins() {
    var translateX = 0, binCounter = 0;
    const maxScore = this.props.globalStats.bins.max || 1;
    const binCount = this.props.region.binCount();
    let previousBinIsHighlighted = false;

    return this.props.region.mapBins((bin) => {
      const isLastBin = (++binCounter === binCount);
      const w = this.props.baseWidth * (bin.end - bin.start + 1);
      const translate = transform(translateX + (previousBinIsHighlighted ? 1 : 0), 0);

      translateX += w;

      if (bin.results.count) {
        const isSelected = this.isBinSelected(bin);
        const isHighlighted = !isSelected && this.state.hoveredBin && this.state.hoveredBin.idx === bin.idx;
        const score = bin.results.count / maxScore;
        const fillColor = binColor(this.props.regionIdx, score,
          this.props.region.name === 'UNANCHORED');

        const props = {
          key: bin.idx,
          className: 'bin' + (isSelected ? ' selected' : '') + (isHighlighted ? ' hovered' : ''),
          // work with antialiasing artifacts by making the bins bigger, unless it's teh last on or highlighted.
          width: w + (isLastBin || isHighlighted || isSelected ? 0 : 1),
          height: this.props.height,
          fill: fillColor,
          onMouseOver: (e)=>this.handleBinHighlight(bin, e),
          onMouseOut: (e)=>this.handleMouseOut(bin, e),
          // onClick: (e)=>this.handleBinSelection(bin, e),
          onMouseDown: (e)=>this.handleBinSelectionStart(bin, e),
          onMouseUp: (e)=>this.handleBinSelectionEnd(bin, e)
        };

        previousBinIsHighlighted = isHighlighted || isSelected;

        // SIDE EFFECTS
        return (
          <rect {...props}
            {...translate} />
        );
      }
    });
  }

  isBinSelected(bin) {
    return this.isInDraggingRange(bin) || this.isInSelection()
  }

  isInDraggingRange(bin) {
    const dragStartBin = dragging;
    if (dragStartBin) {
      const startIdx = Math.min(dragStartBin.idx, this.state.hoveredBin.idx);
      const endIdx = Math.max(dragStartBin.idx, this.state.hoveredBin.idx);

      return bin.idx >= startIdx && bin.idx <= endIdx;
    }
  }

  isInSelection(bin) {
    return false;
  }
}

Region.propTypes = {
  regionIdx: React.PropTypes.number.isRequired,
  region: React.PropTypes.object.isRequired,
  genome: React.PropTypes.object.isRequired,
  state: React.PropTypes.object.isRequired,
  onSelectionStart: React.PropTypes.func.isRequired,
  onSelection: React.PropTypes.func.isRequired,
  onHighlight: React.PropTypes.func.isRequired,
  globalStats: React.PropTypes.object.isRequired,
  baseWidth: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  isLastRegion: React.PropTypes.bool.isRequired,
  color: React.PropTypes.string.isRequired
};