'use strict';

import React from "react";

const radius = 2.5;
const Node = ({node, displayInfo, onSelect}) =>
  <g className={className(displayInfo)}
     onClick={onSelect}>
    <circle className="circle" r={radius}/>
  </g>;

function className(displayInfo) {
  let className = 'node';
  if(displayInfo.highlight) {
    className += ' highlight';
  }
  return className;
}

export { radius };
export default Node;