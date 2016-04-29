import React from 'react';

import Region from './Region.jsx';
import { regionColor } from './util/colors';
import transform from './util/transform';

export default class Genome extends React.Component {

  constructor(props) {
    super(props);
    this.updateResultsCount(props);
    this.svgMetrics = props.svgMetrics;
    this.firstBin = props.genome.startBin;
    this.lastBin = props.genome.startBin + props.genome.nbins - 1;
    this.genomeSelection = this.getRelevantSelection(props.state.selection);
  }

  getSetResultsCallCount(props) {
    return props.globalStats.timesSetResultsHasBeenCalled;
  }

  didResultsChange(props) {
    const newResultsState = this.getSetResultsCallCount(props);
    return this.genomeResultsState !== newResultsState;
  }

  updateResultsCount(props) {
    this.genomeResultsState = this.getSetResultsCallCount(props);
  }

  didMetricsUpdate(newMetrics) {
    const result = !_.isEqual(this.svgMetrics, newMetrics);
    if(result) {
      this.svgMetrics = newMetrics;
    }
    return result;
  }

  getRelevantSelection(selection) {
    return _.pickBy(selection, (bin, idx)=> idx >= this.firstBin && idx <= this.lastBin);
  }

  didSelectionChange(selection) {
    const relevantSelection = this.getRelevantSelection(selection);
    const result = !_.isEqual(this.genomeSelection, relevantSelection);
    if(result) {
      this.genomeSelection = relevantSelection;
    }
    return result;
  }

  didHighlightChange(highlight) {
    const isHighlighted = _.get(highlight, 'genome.taxon_id') === this.props.genome.taxon_id;
    const result = isHighlighted || !!this.wasHighlighted;

    this.wasHighlighted = isHighlighted;
    return result;
  }

  shouldComponentUpdate(newProps) {
    // only re-render this component if the results changed.
    const decision = this.didResultsChange(newProps)
      || this.didMetricsUpdate(newProps.svgMetrics)
      || this.didSelectionChange(newProps.state.selection)
      || this.didHighlightChange(newProps.state.highlight);
    this.updateResultsCount(newProps);
    return decision;
  }
  
  render() {
    return (
      <g className="genome">
        <g className="regions">
          {this.renderRegions()}
        </g>
      </g>
    );
  }

  baseWidth() {
    return this.props.svgMetrics.width.genomes / this.props.genome.fullGenomeSize;
  }
  
  renderRegions() {
    const baseWidth = this.baseWidth();
    const numRegions = this.props.genome.regionCount();
    var translateX = 0;

    return this.props.genome.mapRegions((region, idx) => {
      const translate = transform(translateX, 0);
      const isLastRegion = (idx + 1) === numRegions;

      // SIDE EFFECTS
      translateX += region.size * baseWidth;

      return (
        <g className="region-wrapper"
           key={idx}
           {...translate}>
          <Region regionIdx={idx}
                  region={region}
                  genome={this.props.genome}
                  color={regionColor(idx, region.name === 'UNANCHORED')}
                  baseWidth={baseWidth}
                  isLastRegion={isLastRegion}
                  height={this.props.height}
                  globalStats={this.props.globalStats}
                  onHighlight={this.props.onHighlight}
                  onSelection={this.props.onSelection}
                  onSelectionStart={this.props.onSelectionStart}
                  state={this.props.state}
          />
        </g>
      );
    });
  }
}

Genome.propTypes = {
  genome: React.PropTypes.object.isRequired,
  globalStats: React.PropTypes.object.isRequired,
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  svgMetrics: React.PropTypes.object.isRequired,

  state: React.PropTypes.object.isRequired,
  onSelectionStart: React.PropTypes.func.isRequired,
  onSelection: React.PropTypes.func.isRequired,
  onHighlight: React.PropTypes.func.isRequired
};