import React from 'react';
import d3 from 'd3';

import microsoftBrowser from './util/microsoftBrowser';

export default class Edge extends React.Component {
  render() {
    // return (
    //   <g className="edge">
    //     <rect x="0" y="0" width="1" height="1" {...this.rect1Props()}/>
    //     <rect x="0" y="0" width="1" height="1" {...this.rect2Props()}/>
    //   </g>
    // )
    return (
      <g className="edge">
        <rect x="0" y="0" width="1" height="1" {...this.rect1Props()}/>
        <rect x="0" y="0" width="1" height="1" {...this.rect2Props()}/>
      </g>
    )
  }
  
  rect1Props() {
    return this.rectProps((di, size, px) =>
      `translate(0${px}, ${-size/2}${px}) scale(${-di.offsetY - size/2}, ${size})`
    )
  }
  
  rect2Props() {
    return this.rectProps((di, size, px) =>
      `translate(${-di.offsetY - size/2}${px}, 0${px}) scale(${size}, ${-di.offsetX})`
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