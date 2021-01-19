import React from "react";
import {drawGenomes, nameFor} from "./Genome";
import {drawHighlightsAndSelections} from "./Highlight";
import PropsComparer from "../util/PropsComparer";
import mergeSelections from "../util/mergeSelections";
import _ from "lodash";

export default class Genomes extends React.Component {
  constructor(props) {
    super(props);

    this.state = {events: []};

    this.doGenomeRedrawProps = new PropsComparer(
        'globalStats.timesSetResultsHasBeenCalled',
        'svgMetrics',
        'nodeDisplayInfo'
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

    const objectLocations = drawGenomes(ctx, props.genomes, metrics, globalStats);
    this.setState({objectLocations});
  }

  drawHighlightsAndSelections(props = this.props) {
    const ctx = this.refs.highlightCanvas.getContext("2d");

    drawHighlightsAndSelections(
        props.highlight,
        props.selections,
        props.inProgressSelection,
        ctx
    );
  }

  getHighlightFromEventCoordinates(coords) {
    let highlight = this.getHighlightCoords(coords);

    if(this.state.objectLocations) {
      const objectLocations = this.state.objectLocations[highlight.y];
      if(objectLocations && objectLocations.xPixels) {
        _.assign(
            highlight,
            objectLocations.xPixels[highlight.x]
        );
      }
    }

    highlight.name = nameFor(highlight);

    return highlight;
  }

  getHighlightCoords(coords) {
    const {offsetX, offsetY} = coords;
    const {margin, height} = this.metrics();

    // if we have an in-progress selection, then take Y coord from that
    // in order to maintain selection in same genome.
    const y = _.get(this.props.inProgressSelection, 'y', offsetY);

    return {
      x: offsetX,
      y: y - ( (y - margin) % height),
      height
    };
  }

  getSelectionFromEventCoordinates(coords) {
    const highlight = this.getHighlightFromEventCoordinates(coords);
    const selection = _.omit(highlight, 'bins');
    selection.binFrom = _.head(highlight.bins);
    selection.binTo = _.last(highlight.bins);
    // if the first bin is already selected, we will be deselecting.
    selection.select = !this.isBinAlreadySelected(selection.binFrom);
    return selection;
  }

  isBinAlreadySelected(bin) {
    return !!_.find(this.props.selections,
                    (selection) => selection.binFrom && selection.binFrom.idx <= bin.idx && selection.binTo.idx >= bin.idx
    );
  }

  getOffsetCoordsForTouchEvent(e) {
    const firstTouch = _.get(e.nativeEvent, 'touches[0]');
    if (!firstTouch) {
      throw new Error("No touch information in event", e);
    }

    const offsetX = firstTouch.pageX - firstTouch.target.offsetLeft;
    const offsetY = firstTouch.pageY - firstTouch.target.offsetTop;
    return {offsetX, offsetY};
  }

  onMouseMove(e) {
    this.logEvent(e);
    e.preventDefault();
    this.handleMove(e.nativeEvent);
  }

  onTouchMove(e) {
    this.logEvent(e);
    e.preventDefault();
    e.stopPropagation();
    this.handleMove(this.getOffsetCoordsForTouchEvent(e));
  }

  handleMove(coords) {
    this.props.onHighlight(this.getHighlightFromEventCoordinates(coords));
  }

  onMouseDown(e) {
    this.logEvent(e);
    this.handleSelectionStart(e.nativeEvent);
  }

  onTouchStart(e) {
    e.preventDefault();
    e.stopPropagation();

    this.logEvent(e);
    this.handleSelectionStart(this.getOffsetCoordsForTouchEvent(e));
  }

  handleSelectionStart(coords) {
    this.props.onSelectionStart(this.getSelectionFromEventCoordinates(coords));
  }

  onTouchEnd(e) {
    e.preventDefault();
    e.stopPropagation();

    this.logEvent(e);
    this.handleSelection(this.getOffsetCoordsForTouchEvent(e));
  }

  handleSelection(coords) {
    const selectionStart = this.props.inProgressSelection;
    if (selectionStart) {
      // Lock Y coordinate like this in order to allow contiguous selection
      // *within a genome*
      const fakeCoords = {
        offsetX: coords.offsetX,
        offsetY: selectionStart.y
      };
      const selectionEnd = this.getSelectionFromEventCoordinates(fakeCoords);
      this.props.onSelection(mergeSelections(selectionStart, selectionEnd));
    }
  }

  onClick(e) {
    this.logEvent(e);
    e.preventDefault();
    e.stopPropagation();
    const numberOfClicks = e.nativeEvent.detail;
    const ne = e.nativeEvent;
    if (numberOfClicks === 1) {
      this.handleSelection(ne);
      return;
    }

    const selection = this.getSelectionFromEventCoordinates(ne);
    switch (numberOfClicks) {
      case 2:
        this.selectRegion(selection);
        break;
      case 3:
        this.selectGenome(selection);
        break;
    }

  }

  selectRegion(selection) {
    const {region, regionDims} = selection;
    selection.binFrom = region.firstBin();
    selection.binTo = region.bin(region.binCount() - 1);
    selection.x = regionDims.x;
    selection.width = regionDims.width;
    selection.select = !selection.select; // it's state was changed on the first click.
    this.props.onSelection(selection);
  }

  selectGenome(selection) {
    const rootNode = this.props.rootNode;
    const genome = selection.genome;
    const metrics = this.metrics();
    selection.binFrom = rootNode.getBin(genome.startBin);
    selection.binTo = rootNode.getBin(genome.startBin + genome.nbins - 1);
    selection.x = metrics.padding;
    selection.width = metrics.width;
    selection.select = !selection.select; // it's state was changed on the previous two clicks
    this.props.onSelection(selection);
  }

  cancelSelection(e) {
    this.logEvent(e);
    this.props.onSelectionStart();
  }

  logEvent(e) {
    const {type, nativeEvent: {offsetX, offsetY, detail, touches}} = e;
    const info = detail || (touches && touches.length);
    const time = new Date();
    this.setState({events: _.concat([], {type, offsetX, offsetY, info, time}, this.state.events)});
  }

  eventLog() {
    return this.state.events.map(
        (e) => <li key={e.time.getTime()}>{String(e.time.getTime()).substr(8)} {e.type}: ({e.offsetX}, {e.offsetY})
          detail: {e.detail}</li>
    );
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
                  onClick={this.onClick.bind(this)}
                  onMouseDown={this.onMouseDown.bind(this)}
                  onMouseMove={this.onMouseMove.bind(this)}
                  onMouseOut={this.cancelSelection.bind(this)}
                  onTouchStart={this.onTouchStart.bind(this)}
                  onTouchMove={this.onTouchMove.bind(this)}
                  onTouchEnd={this.onTouchEnd.bind(this)}
                  onTouchCancel={this.cancelSelection.bind(this)}/>
          <ul style={{display: 'block'}}>{this.eventLog()}</ul>
        </div>

    )
  }
}
