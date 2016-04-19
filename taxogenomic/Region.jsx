import React from "react";
import {binColor} from "./util/colors";
import transform from "./util/transform";

export default class Region extends React.Component {
  render() {
    const width = (this.props.region.size * this.props.baseWidth)
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
      const isLastBin = (++binCounter === binCount);
      const w = this.props.baseWidth * (bin.end - bin.start + 1);

      const translate = transform(translateX, 0);
      translateX += w;

      if (bin.results.count) {
        const score = bin.results.count / maxScore;
        const fillColor = binColor(this.props.regionIdx, score, 
          this.props.region.name === 'UNANCHORED');
        
        // SIDE EFFECTS
        return (
          <rect key={bin.idx}
                className="bin"
                {...translate}
                x="0"
                y="0"
                // work around antialiasing by increasing width of each bin
                // by one px, except the last one.
                width={w + (isLastBin ? 0 : 1)}
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
  baseWidth: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  isLastRegion: React.PropTypes.bool.isRequired,
  color: React.PropTypes.string.isRequired
};