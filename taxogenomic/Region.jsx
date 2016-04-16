import React from "react";
import {binColor} from "./util/colors";

export default class Region extends React.Component {
  render() {
    const width = this.props.region.binCount() * this.props.binWidth;
    return (
      <g>
        <rect x="0"
              y="0"
              width={width}
              height={this.props.height}
              fill={this.props.color}
              shapeRendering="crispEdges"
              onMouseOver={()=>console.log(this.props.region)}
        />
        {this.renderBins()}
      </g>
    );
  }

  renderBins() {
    var translateX = 0;
    const maxScore = this.props.globalStats.bins.max || 1;

    return this.props.region.mapBins((bin) => {

        const transform = `translate(${translateX}, 0)`;
        translateX += this.props.binWidth;
        if (bin.results.count) {
          const score = bin.results.count / maxScore;
          const fillColor = this.props.region.name === 'UNANCHORED' ?
            '#d3d3d3' :
            binColor(this.props.regionIdx, score);
          // SIDE EFFECTS
          return (
            <rect key={bin.idx}
                  transform={transform}
                  x="0"
                  y="0"
                  width={this.props.binWidth}
                  height={this.props.height}
                  fill={fillColor}
                  shapeRendering="crispEdges"
                  onMouseOver={(e)=>console.log(bin)}
            />
          );

          // return (
          //
          // <g key={bin.name}
          //      transform={transform}>
          //     <Bin bin={bin}
          //          width={this.props.binWidth}
          //          height={this.props.height}/>
          //   </g>
          // );
        }
      }
    )
  }
}

Region.propTypes = {
  regionIdx: React.PropTypes.number.isRequired,
  region: React.PropTypes.object.isRequired,
  globalStats: React.PropTypes.object.isRequired,
  binWidth: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  color: React.PropTypes.string.isRequired
};