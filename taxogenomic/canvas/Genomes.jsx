import React from "react";
import {visibleLeafNodes} from "../util/visibleLeafNodes";
import {drawGenome} from "./Genome";

export default class Genomes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      genomes: this.initGenomeState(props)
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      genomes: this.initGenomeState(props)
    });
  }

  initGenomeState(props) {
    return visibleLeafNodes(props.rootNode, props.nodeDisplayInfo).map((node) => node.model.genome);

  }

  componentDidMount() {
    this.drawGenomes();
  }

  componentDidUpdate() {
    this.drawGenomes();
  }

  drawGenomes(props = this.props, state = this.state) {
    const width = props.svgMetrics.width.genomes;
    const height = props.svgMetrics.height.leafNode;
    const padding = props.svgMetrics.layout.genomePadding;
    const ctx = this.refs.genomesCanvas.getContext("2d");
    const globalStats = props.rootNode.globalResultSetStats();

    state.genomes.forEach((genome, idx) => {
      const x = padding;
      const y = idx * height + padding;
      drawGenome({genome, ctx, x, y, width, height, globalStats, padding});
    });
  }

  drawHighlights(props = this.props) {

  }

  handleMouseMove(e) {
    const {offsetX, offsetY} = e.nativeEvent;
    const genome = this.genomeFromMouseYPosition(offsetY);
    console.log('move', offsetX, offsetY, this.locationFromMouseXPosition(genome, offsetX));
  }

  genomeFromMouseYPosition(y) {
    const height = this.props.svgMetrics.height.leafNode;
    const padding = this.props.svgMetrics.layout.genomePadding;
    const idx = Math.floor((y - padding) / height);
    return this.state.genomes[idx];
  }

  locationFromMouseXPosition(genome, x) {
    if (!genome) return;

    const width = this.props.svgMetrics.width.genomes;
    const padding = this.props.svgMetrics.layout.genomePadding;
    const basesPerPx = genome.fullGenomeSize / (width - padding);
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
          if(cumulativeBases >= basePosition) {
            bins.push(bin);

            // keep going til all bins in the pixel are captured.
            if(cumulativeBases >= basePosition + basesPerPx) {
              break;
            }
          }
        }
        break;
      }
      cumulativeBases += region.size;
    }

    return {bins, region, genome, binIdx: bin.idx, px, basePosition, basesPerPx};
  }

  render() {
    const metrics = this.props.svgMetrics;
    const genomes = visibleLeafNodes(this.props.rootNode, this.props.nodeDisplayInfo);
    const dimensions = {
      height: genomes.length * metrics.height.leafNode + metrics.layout.margin,
      width: metrics.width.genomes
    };

    return <div className="genomes">
      <canvas ref="genomesCanvas"
          {...dimensions}
              onMouseMove={this.handleMouseMove.bind(this)}
      />
      <canvas ref="highlightCanvas"
          {...dimensions} />
    </div>
  }
}

Genomes.propTypes = {
  rootNode: React.PropTypes.object.isRequired,
  nodeDisplayInfo: React.PropTypes.object.isRequired,
  svgMetrics: React.PropTypes.object.isRequired,

  highlight: React.PropTypes.object,
  selection: React.PropTypes.object,
  inProgressSelection: React.PropTypes.object,
  onSelection: React.PropTypes.func.isRequired,
  onSelectionStart: React.PropTypes.func.isRequired,
  onHighlight: React.PropTypes.func.isRequired
};