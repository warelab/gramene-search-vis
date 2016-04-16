import React from "react";
import {binColor} from "./util/colors";

export default class Region extends React.Component {
  render() {
    const width = (this.props.region.binCount() * this.props.binWidth)
      // avoid antialiasing artifacts by increasing width by 1px
      // unless it's the last one.
      + (this.props.isLastRegion ? 0 : 1);
    return (
      <g className="region">
        <rect x="0"
              y="0"
              className="full-region"
              width={width + 1} // overdraw by 1 px to get around aliasing problem
              height={this.props.height}
              fill={this.props.color}
              onMouseOver={()=>console.log(this.props.region)}
        />
        {this.renderBins()}
      </g>
    );
  }

  renderBins() {
    var translateX = 0, binCounter = 0;
    const maxScore = this.props.globalStats.bins.max || 1;
    const binCount = this.props.region.binCount();

    return this.props.region.mapBins((bin) => {
      const transform = `translate(${translateX}, 0)`;
      translateX += this.props.binWidth;

      // work around antialiasing by increasing width of each bin
      // by one px, except the last one.
      const isLastBin = (++binCounter === binCount);
      const w = this.props.binWidth + (isLastBin ? 0 : 1);

      if (bin.results.count) {
        const score = bin.results.count / maxScore;
        const fillColor = this.props.region.name === 'UNANCHORED' ?
          '#d3d3d3' :
          binColor(this.props.regionIdx, score);
        // SIDE EFFECTS
        return (
          <rect key={bin.idx}
                className="bin"
                transform={transform}
                x="0"
                y="0"
                width={w}
                height={this.props.height}
                fill={fillColor}
                onMouseOver={(e)=>console.log(bin)}
          />
        );
      }
    });
  }
}

Region.propTypes = {
  regionIdx: React.PropTypes.number.isRequired,
  region: React.PropTypes.object.isRequired,
  globalStats: React.PropTypes.object.isRequired,
  binWidth: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  isLastRegion: React.PropTypes.bool.isRequired,
  color: React.PropTypes.string.isRequired
};