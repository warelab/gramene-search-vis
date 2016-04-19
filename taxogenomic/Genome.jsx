import React from 'react';

import Region from './Region.jsx';
import { regionColor } from './util/colors';
import transform from './util/transform';

export default class Genome extends React.Component {

  constructor(props) {
    super(props);
    this.updateResultsCount(props);
    this.svgMetrics = props.svgMetrics;
  }

  getSetResultsCallCount(props) {
    return props.globalStats.timesSetResultsHasBeenCalled;
  }

  didResultsChange(props) {
    const newResultsState = this.getSetResultsCallCount(props);
    return this.genomeResultsState !== newResultsState;
  }

  updateResultsCount(props) {
    this.genomeResultsState = this.getSetResultsCallCount(props);;
  }

  didMetricsUpdate(newMetrics) {
    const result = !_.isEqual(this.svgMetrics, newMetrics);
    if(result) {
      this.svgMetrics = newMetrics;
    }
    return result;
  }

  shouldComponentUpdate(newProps) {
    // only re-render this component if the results changed.
    const decision = this.didResultsChange(newProps) || this.didMetricsUpdate(newProps.svgMetrics);
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
    // return (
    //   <g className="genome">
    //     <rect className="interaction-helper"
    //           x={0} y={0}
    //           width={this.props.width}
    //           height={this.props.height}/>
    //     <g className="regions">
    //       {this.renderRegions()}
    //     </g>
    //   </g>
    // )
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
                  color={regionColor(idx, region.name === 'UNANCHORED')}
                  baseWidth={baseWidth}
                  isLastRegion={isLastRegion}
                  height={this.props.height}
                  globalStats={this.props.globalStats}
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
  svgMetrics: React.PropTypes.object.isRequired
};