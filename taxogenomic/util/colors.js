import * as d3 from "d3";
import * as d3chrom from "d3-scale-chromatic";
const regionColors = d3chrom.schemeCategory10;
const unanchoredColor ='#d3d3d3';
const baseColors = d3chrom.schemeCategory10;

// const baseColors = d3.scaleOrdinal(d3.schemeCategory10);
// const baseColors = ['#547b74', '#9abe6c'];
const regionColorScales = baseColors.map((color) =>
  d3.scaleLinear().domain([0, 1]).range(['#FFFFFF', color])
);
const binColorScales = regionColorScales.map((scale, idx) =>
  d3.scalePow().exponent(0.4).domain([0, 1]).range([scale(0.15), baseColors[idx]])
);
// const regionColors = regionColorScales.map((scale) =>
//   scale(0.20)
// );

export function regionColor(regionIdx, isUnanchored) {
  if(isUnanchored) {
    return unanchoredColor;
  }
  const idx = regionIdx % regionColors.length;
  return regionColors[idx];
}

export function binColor(regionIdx, binScore, isUnanchored) {
  if(isUnanchored) {
    return unanchoredColor;
  }
  const idx = regionIdx % regionColors.length;
  return binColorScales[idx](binScore);
}
