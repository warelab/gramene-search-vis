import React from "react";
import {drawGenomes, getObjectsFromCoordinates} from "./Genome";
import {drawHighlightsAndSelections} from "./Highlight";
import PropsComparer from "../util/PropsComparer";
import mergeSelections from "../util/mergeSelections";

export default class Genomes extends React.Component {
  constructor(props) {
    super(props);

    this.doGenomeRedrawProps = new PropsComparer(
        'globalStats.timesSetResultsHasBeenCalled',
        'selection',
        'svgMetrics'
    );

    this.doHighlightRedrawProps = new PropsComparer(
        'highlight',
        'inProgressSelection'
    );
  }

  componentWillReceiveProps(props) {
    this.genomeCanvasDirty = this.doGenomeRedrawProps.differ(props, this.props);
    this.highlightCanvasDirty = this.doHighlightRedrawProps.differ(props, this.props);
  }

  componentDidMount() {
    this.drawImage();
    this.drawHighlightsAndSelections();
  }

  componentDidUpdate() {
    if (this.genomeCanvasDirty) {
      this.drawImage();
      this.genomeCanvasDirty = false;
    }

    if (this.highlightCanvasDirty) {
      this.drawHighlightsAndSelections();
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

  drawImage(props = this.props) {
    const metrics = this.metrics(props);
    const globalStats = props.globalStats;
    const ctx = this.refs.genomesCanvas.getContext("2d");

    drawGenomes(ctx, props.genomes, metrics, globalStats);
  }

  drawHighlightsAndSelections(props = this.props) {
    const ctx = this.refs.highlightCanvas.getContext("2d");
    const metrics = this.metrics(props);

    drawHighlightsAndSelections(
        props.highlight,
        props.selection,
        props.inProgressSelection,
        ctx,
        metrics,
        props.genomes
    );
  }

  getHighlightFromEventCoordinates(e) {
    const {offsetX, offsetY} = e.nativeEvent;

    // if we have an in-progress selection, then take Y coord from that
    // in order to maintain selection in same genome.
    const y = _.get(this.props.inProgressSelection, 'y', offsetY);

    const ctx = this.refs.genomesCanvas.getContext("2d");
    return getObjectsFromCoordinates(
        ctx,
        this.props.genomes,
        this.metrics(),
        this.props.globalStats,
        offsetX,
        y
    );
  }

  getSelectionFromEventCoordinates(e) {
    const highlight = this.getHighlightFromEventCoordinates(e);
    const selection = _.omit(highlight, 'bins');
    selection.binFrom = _.head(highlight.bins);
    selection.binTo = _.last(highlight.bins);
    // if the first bin is already selected, we will be deselecting.
    selection.select = !this.isBinAlreadySelected(selection.binFrom); 
    return selection;
  }
  
  isBinAlreadySelected(bin) {
    return _.get(this.props.selection.bins[bin.idx], 'select', false);
  }

  handleMouseMove(e) {
    e.preventDefault();
    this.props.onHighlight(this.getHighlightFromEventCoordinates(e));
  }

  handleSelectionStart(e) {
    this.props.onSelectionStart(this.getSelectionFromEventCoordinates(e));
  }

  handleSelection(e) {
    const selectionStart = this.props.inProgressSelection;
    if(selectionStart) {
      // Lock Y coordinate like this in order to allow contiguous selection
      // *within a genome*
      const fakeEvent = {nativeEvent: {
        offsetX: e.nativeEvent.offsetX, 
        offsetY: selectionStart.y
      }};
      const selectionEnd = this.getSelectionFromEventCoordinates(fakeEvent);
      this.props.onSelection(mergeSelections(selectionStart, selectionEnd));
    }
  }

  cancelSelection(e) {

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
                  onMouseMove={this.handleMouseMove.bind(this)}
                  onMouseDown={this.handleSelectionStart.bind(this)}
                  onMouseUp={this.handleSelection.bind(this)}
                  onMouseOut={this.cancelSelection.bind(this)} />
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