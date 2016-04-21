'use strict';

import React from "react";

const Node = ({node, displayInfo, onSelect, radius}) =>
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

export default Node;