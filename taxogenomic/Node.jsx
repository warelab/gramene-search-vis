'use strict';

import React from "react";

const Node = ({node, displayInfo, onSelect}) =>
  <g className="node"
     onClick={onSelect}>
    <circle className="circle" r="2.5"/>
  </g>;

export default Node;