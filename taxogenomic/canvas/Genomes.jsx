import React from "react";
import {drawGenomes, getObjectsFromGenomes} from "./Genome";
import {drawHighlight, getHighligtedBinsFromMousePosition} from "./Highlight";
import PropsComparer from "../util/PropsComparer";

export default class Genomes extends React.Component {
  constructor(props) {
    super(props);

    this.doGenomeRedrawProps = new PropsComparer(
        'globalStats.timesSetResultsHasBeenCalled',
        'svgMetrics'
    );

    this.doHighlightRedrawProps = new PropsComparer(
        'highlight',
        'selection',
        'inProgressSelection'
    );
  }

  componentWillReceiveProps(props) {
    this.genomeCanvasDirty = this.doGenomeRedrawProps.differ(props, this.props);
    this.highlightCanvasDirty = this.doHighlightRedrawProps.differ(props, this.props);
  }

  componentDidMount() {
    this.drawImage();
    this.drawHighlights();
  }

  componentDidUpdate() {
    if (this.genomeCanvasDirty) {
      this.drawImage();
      this.genomeCanvasDirty = false;
    }

    if (this.highlightCanvasDirty) {
      this.drawHighlights();
      this.highlightCanvasDirty = false;
    }
  }
  
  metrics(props = this.props) {
    const padding = props.svgMetrics.layout.genomePadding;
    const margin = props.svgMetrics.layout.margin;
    const width = props.svgMetrics.width.genomes;
    const height = props.svgMetrics.height.leafNode;
    const unpaddedHeight = height - padding;
    
    return {padding, margin, width, height, unpaddedHeight};
  }

  drawImage(props = this.props, state = this.state) {
    console.log('drawImage');
    const metrics = this.metrics(props);
    const globalStats = props.globalStats;

    const ctx = this.refs.genomesCanvas.getContext("2d");

    drawGenomes(ctx, props.genomes, metrics, globalStats);
    // props.genomes.forEach((genome, idx) => {
    //   const x = metrics.padding;
    //   const y = idx * metrics.height + metrics.margin;
    //   drawGenome({genome, genomeCtx: ctx, x, y, globalStats, width: metrics.width, height: metrics.unpaddedHeight});
    // });
  }

  drawHighlights(props = this.props, state = this.state) {
    const ctx = this.refs.highlightCanvas.getContext("2d");
    const metrics = this.metrics(props);
    
    drawHighlight(props.highlight, ctx, metrics, props.genomes);
    
  }

  handleMouseMove(e) {
    e.preventDefault();
    const {offsetX, offsetY} = e.nativeEvent;
    const ctx = this.refs.genomesCanvas.getContext("2d");
    const highlight = getObjectsFromGenomes(
        ctx,
        this.props.genomes,
        this.metrics(),
        this.props.globalStats,
        offsetX,
        offsetY
    );

    this.props.onHighlight(highlight);
  }

  genomeFromMouseYPosition(y) {
    const height = this.props.svgMetrics.height.leafNode;
    const padding = this.props.svgMetrics.layout.genomePadding;
    const idx = Math.floor((y - padding) / height);
    return this.props.genomes[idx];
  }

  getHighligtedBinsFromMousePosition(x, y) {
    const genome = this.genomeFromMouseYPosition(y);
    if (!genome) return;

    const width = this.props.svgMetrics.width.genomes;
    const padding = this.props.svgMetrics.layout.genomePadding;
    const margin = this.props.svgMetrics.layout.margin;
    const basesPerPx = genome.fullGenomeSize / (width - margin);
    const px = x - padding;
    const basePosition = basesPerPx * px;
    const regions = genome._regionsArray;
    let region, bin, bins = [];
    let cumulativeBases = 0;
    for (let regionIdx = 0; regionIdx < regions.length; regionIdx++) {
      region = regions[regionIdx];
      if (cumulativeBases + region.size >= basePosition) {
        for (let binIdx = 0; binIdx < region.binCount(); binIdx++) {
          bin = region.bin(binIdx);
          const binLen = bin.end - bin.start + 1;
          cumulativeBases += binLen;

          // if we've got to the mouse position:
          if (cumulativeBases >= basePosition) {
            bins.push(bin);

            // keep going til all bins in the pixel are captured.
            if (cumulativeBases >= basePosition + basesPerPx) {
              break;
            }
          }
        }
        break;
      }
      cumulativeBases += region.size;
    }

    return {bins, region, genome, x, y};
  }

  render() {
    const metrics = this.props.svgMetrics;
    const dimensions = {
      height: this.props.genomes.length * metrics.height.leafNode + metrics.layout.margin,
      width: metrics.width.genomes + metrics.layout.genomePadding * 2
    };


    return (
        <div className="genomes">
          <canvas ref="genomesCanvas"
              {...dimensions} />
          <canvas ref="highlightCanvas"
              {...dimensions}
                  onMouseMove={this.handleMouseMove.bind(this)} />
        </div>
    )
  }
}

Genomes.propTypes = {
  globalStats: React.PropTypes.object.isRequired,
  genomes: React.PropTypes.array.isRequired,
  svgMetrics: React.PropTypes.object.isRequired,

  highlight: React.PropTypes.object,
  selection: React.PropTypes.object,
  inProgressSelection: React.PropTypes.object,
  onSelection: React.PropTypes.func.isRequired,
  onSelectionStart: React.PropTypes.func.isRequired,
  onHighlight: React.PropTypes.func.isRequired
};