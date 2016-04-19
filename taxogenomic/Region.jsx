import React from "react";
import {binColor} from "./util/colors";
import transform from "./util/transform";

export default class Region extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const width = (this.props.region.size * this.props.baseWidth)
      // avoid antialiasing artifacts by increasing width by 1px
      // unless it's the last one.
      + (this.props.isLastRegion ? 0 : 1);
    return (
      <g className="region" onMouseOut={()=>this.setState({hoveredBin:undefined})}>
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
        const isHighlighted = this.state.hoveredBin === bin.idx;
        const score = bin.results.count / maxScore;
        const fillColor = binColor(this.props.regionIdx, score,
          this.props.region.name === 'UNANCHORED');

        const props = {
          key: bin.idx,
          className: 'bin' + (isHighlighted ? ' hovered' : ''),
          // work with antialiasing artifacts by making the bins bigger, unless it's teh last on or highlighted.
          width: w + (isLastBin || isHighlighted ? 0 : 1),
          height: this.props.height,
          fill: fillColor,
          onMouseOver: ()=>this.setState({hoveredBin: bin.idx})
        };
        
        // SIDE EFFECTS
        return (
          <rect {...props}
                {...translate} />
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