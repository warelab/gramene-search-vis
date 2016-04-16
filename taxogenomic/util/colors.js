import d3 from 'd3';

const baseColors = d3.scale.category10().range();
// const baseColors = ['#547b74', '#9abe6c'];
const regionColorScales = baseColors.map((color) =>
  d3.scale.linear().domain([0, 1]).range(['#FFFFFF', color])
);
const binColorScales = regionColorScales.map((scale, idx) =>
  d3.scale.linear().domain([0, 1]).range([scale(0.35), baseColors[idx]])
);
const regionColors = regionColorScales.map((scale) =>
  scale(0.20)
);

export function regionColor(regionIdx) {
  const idx = regionIdx % baseColors.length;
  return regionColors[idx];
}

export function binColor(regionIdx, binScore) {
  const idx = regionIdx % baseColors.length;
  return binColorScales[idx](binScore);
}