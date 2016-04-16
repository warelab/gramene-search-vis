import React from 'react';

import Region from './Region.jsx';
import { regionColor } from './util/colors';

import { genomesWidth } from '../reactVis.jsx';

export default class Genome extends React.Component {

  render() {
    return (
      <g className="genome">
        {this.renderRegions()}
      </g>
    )
  }

  binWidth() {
    return genomesWidth / this.props.genome.nbins;
  }
  
  renderRegions() {
    const binWidth = this.binWidth();
    const numRegions = this.props.genome.regionCount();
    var translateX = 0;

    return this.props.genome.mapRegions((region, idx) => {
      const transform = `translate(${translateX}, 0)`;
      const isLastRegion = (idx + 1) === numRegions;

      // SIDE EFFECTS
      translateX += region.binCount() * binWidth;

      return (
        <g className="region-wrapper"
           key={idx}
           transform={transform}>
          <Region regionIdx={idx}
                  region={region}
                  color={regionColor(idx)}
                  binWidth={binWidth}
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
  height: React.PropTypes.number.isRequired
};