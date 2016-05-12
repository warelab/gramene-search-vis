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


export function getHighligtedBinsFromMousePosition(x, y, metrics, genomes) {
  const genome = getGenomeFromMouseYPosition();
  if (genome) return getBinAndRegionFromMouseXPosition();

  
  function getBinAndRegionFromMouseXPosition() {
    const width = metrics.width;
    const padding = metrics.padding;
    const margin = metrics.margin;
    const basesPerPx = genome.fullGenomeSize / (width - margin);
    const px = x - padding;
    const basePosition = basesPerPx * px;
    const regions = genome._regionsArray;
    let region, bin, bins = [];
    let cumulativeBases = 0;
    for (let regionIdx = 0; regionIdx < regions.length; regionIdx++) {
      region = regions[regionIdx];
      if (cumulativeBases + region.size >= basePosition) {
        for (let binIdx = 0; binIdx < region.binCount(); binIdx++) {
          bin = region.bin(binIdx);
          const binLen = bin.end - bin.start + 1;
          cumulativeBases += binLen;

          // if we've got to the mouse position:
          if (cumulativeBases >= basePosition) {
            bins.push(bin);

            // keep going til all bins in the pixel are captured.
            if (cumulativeBases >= basePosition + basesPerPx) {
              break;
            }
          }
        }
        break;
      }
      cumulativeBases += region.size;
    }

    const startBase = _.head(bins).start;
    const endBase = _.last(bins).end;
    const name = `${genome.system_name} ${region.name}:${startBase}-${endBase}`;

    return {bins, region, genome, x, y, name};
  }

  function getGenomeFromMouseYPosition() {
    const height = metrics.height;
    const padding = metrics.padding;
    const idx = Math.floor((y - padding) / height);
    return genomes[idx];
  }
}

