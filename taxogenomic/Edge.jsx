import React from "react";
import {radius} from "./Node.jsx";
import microsoftBrowser from "./util/microsoftBrowser";

const circleStroke = 1; // px, defined in taxonomy.less;
const circleWidth = radius + (circleStroke/2);

export default class Edge extends React.Component {
  render() {
    return (
      <g className={this.className()}>
        <rect x="0" y="0" width="1" height="1" {...this.rect1Props()}/>
        <rect x="0" y="0" width="1" height="1" {...this.rect2Props()}/>
      </g>
    )
  }

  className() {
    let className = 'edge';
    if(this.props.displayInfo.highlight) {
      console.log('HIGHLIGHT', this.props.node);
      className += ' highlight';
    }
    return className;
  }

  rect1Props() {
    return this.rectProps((di, size, px) => {
        const scaleX = -di.offsetY - size / 2;
        return `translate(0${px}, ${-size / 2}${px}) scale(${scaleX}, ${size})`
      }
    )
  }

  rect2Props() {
    return this.rectProps((di, size, px) => {
        // we need to take into account the size of the parent node.
        const scaleY = di.offsetX > 0 ? circleWidth - di.offsetX : -circleWidth - di.offsetX;
        return `translate(${-di.offsetY - size / 2}${px}, 0${px}) scale(${size}, ${scaleY})`
      }
    )
  }

  rectProps(getXform) {
    const di = this.props.displayInfo;
    const px = microsoftBrowser ? '' : 'px';
    const size = di.lineThickness;
    const transform = getXform(di, size, px);
    return microsoftBrowser ? {transform: transform} : {style: {transform: transform}};
  }
}

Edge.propTypes = {
  node: React.PropTypes.object.isRequired,
  displayInfo: React.PropTypes.object.isRequired
};