import _ from 'lodash';

export function drawHighlight(highlight, ctx, metrics, genomes) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  if (!highlight || !highlight.genome || !highlight.bins || !highlight.bins.length) return;

  const {x, y, genome, region, bins} = highlight;
  const height = metrics.height - metrics.padding;

  const xRange = getBinXRange();
  const yRange = getGenomeYRange();

  ctx.strokeStyle = 'red';
  ctx.strokeRect(xRange.x - 1, yRange.y - 1, xRange.width + 1, yRange.height + 1);

  function getGenomeYRange() {
    if (genome) {
      let y = metrics.margin;
      for (let g of genomes) {
        if (g.taxon_id === genome.taxon_id) {
          return {y: y, height: height};
        }
        y += metrics.height;
      }
    }
    return undefined;
  }

  function getBinXRange() {
    const pixelsPerBase = metrics.width / genome.fullGenomeSize;
    const lengthInPx = bins.reduce(((len, bin)=>len + (bin.end - bin.start + 1) * pixelsPerBase), 0);
    const width = Math.ceil(lengthInPx);
    let start;
    if(_.find(bins, (bin)=>bin.region === 'UNANCHORED')) {
      start = metrics.width - lengthInPx + metrics.padding;
    }
    else {
      start = Math.floor(x - lengthInPx/2);
    }
    return {x: start, width};
  }
}
