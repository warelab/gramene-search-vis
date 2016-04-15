import React from "react";

import Bin from './Bin.jsx';

export default class Region extends React.Component {
  render() {
    const width = this.props.region.binCount() * this.props.binWidth;

    return (
      <g>
        <rect x="0" y="0" width={width} height={this.props.height} fill="red"/>
        {this.renderBins()}
      </g>
    );
  }

  renderBins() {
    var translateX = 0;
    return this.props.region.mapBins((bin) => {
      const transform = `translate(${translateX}, 0)`;

      // SIDE EFFECTS
      translateX += this.props.binWidth;

      return (
        <g key={bin.name}
           transform={transform}>
          <Bin bin={bin}
               width={this.props.binWidth}
               height={this.props.height}/>
        </g>
      );
    })
  }
}

Region.propTypes = {
  region: React.PropTypes.object.isRequired,
  binWidth: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired
};