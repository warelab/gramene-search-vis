'use strict';

import React from "react";

const radius = 2.5;
const Node = ({node, displayInfo, onSelect}) =>
  <g className="node"
     onClick={onSelect}>
    <circle className="circle" r={radius}/>
  </g>;

export { radius };
export default Node;