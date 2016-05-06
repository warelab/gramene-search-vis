import React from "react";
import {binColor} from "./util/colors";
import transform from "./util/transform";

const Bin = ({
  bin,
  isSelected,
  maxScore,
  region,
  regionIdx,
  baseWidth,
  height,
  onRegionSelect,
  onBinHighlight,
  onBinUnhighlight,
  onBinSelectionStart,
  onBinSelectionEnd
}) => {
  const w = baseWidth * (bin.end - bin.start + 1);
  const translateX = (bin.start - region.firstBin().idx) * baseWidth;
  const translate = transform(translateX, 0);

  const score = bin.results.count / maxScore;
  const fillColor = binColor(regionIdx, score,
    region.name === 'UNANCHORED');

  const props = {
    className: 'bin' + (isSelected ? ' selected' : ''),
    width: w,
    height: height,
    fill: fillColor,
    onMouseOver: (e)=>onBinHighlight(bin, e),
    onMouseOut: (e)=>onBinUnhighlight(bin, e),
    onDoubleClick: (e)=>onRegionSelect(e),
    onMouseDown: (e)=>onBinSelectionStart(bin, e),
    onMouseUp: (e)=>onBinSelectionEnd(bin, e)
  };

  return (
    <rect {...props}
      {...translate} />
  );
};

const o = React.PropTypes.object.isRequired;
const f = React.PropTypes.func.isRequired;
const n = React.PropTypes.number.isRequired;
const b = React.PropTypes.bool.isRequired;
Bin.propTypes = {
  bin: o,
  isSelected: b,
  maxScore: n,
  region: o,
  regionIdx: n,
  baseWidth: n,
  height: n,
  onRegionSelect: f,
  onBinHighlight: f,
  onBinUnhighlight: f,
  onBinSelectionStart: f,
  onBinSelectionEnd: f
};

export default Bin;