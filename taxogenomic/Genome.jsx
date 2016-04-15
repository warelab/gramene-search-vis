import React from 'react';

import Region from './Region.jsx';

import { genomesWidth } from '../reactVis.jsx';

export default class Genome extends React.Component {

  render() {
    return (
      <g className="genome">
        <rect x={0}
              y={0}
              width={this.props.width}
              height={this.props.height}
              fill="steelblue"/>
        {this.renderRegions()}
      </g>
    )
  }

  binWidth() {
    return genomesWidth / this.props.genome.nbins;
  }
  
  renderRegions() {
    const binWidth = this.binWidth();
    var translateX = 0;
    return this.props.genome.mapRegions((region) => {
      const transform = `translate(${translateX}, 0)`;

      // SIDE EFFECTS
      translateX += region.binCount() * binWidth;

      return (
        <g key={region.name} 
           transform={transform}>
          <Region region={region} 
                  binWidth={binWidth} 
                  height={this.props.height}/>
        </g>
      );
    });
  }
}

Genome.propTypes = {
  genome: React.PropTypes.object.isRequired,
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired
};