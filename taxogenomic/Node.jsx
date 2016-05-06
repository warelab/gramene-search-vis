'use strict';

import React from "react";
import {OverlayTrigger} from "react-bootstrap";

const Node = ({node, displayInfo, onSelect, radius, popover}) =>
  <g className={className(displayInfo)}
     onClick={(e)=>onSelect(e)}>
    <OverlayTrigger trigger={['focus', 'click']} rootClose
                    placement="bottom"
                    overlay={popover}>
      <g>
        <rect className="interaction-helper" x="-5" y="-5" width="10" height="10"/>
        <circle className="circle" r={radius}/>
      </g>
    </OverlayTrigger>
  </g>;

function className(displayInfo) {
  let className = 'node';
  if (displayInfo.highlight) {
    className += ' highlight';
  }
  return className;
}

export default Node;