import {binColor as calcBinColor} from "../util/colors";
import dataCanvas from "data-canvas";
import _ from "lodash";

export function drawGenomes(ctx, genomes, metrics, globalStats) {
  const dataCtx = dataCanvas.getDataContext(ctx);
  drawOrGetObjectsFromGenomes(dataCtx, genomes, metrics, globalStats);
}

export function getObjectsFromGenomes(ctx, genomes, metrics, globalStats, x, y) {
  const trackingContext = new dataCanvas.ClickTrackingContext(ctx, x, y);
  drawOrGetObjectsFromGenomes(trackingContext, genomes, metrics, globalStats);
  const highlight = formatHit(trackingContext.hit, x, y);
  highlight.name = nameFor(highlight);
  return highlight;
}

function nameFor(highlight) {
  if(!highlight.genome) return 'nothing here';

  let name = highlight.genome.system_name;
  if(!highlight.region) return name;

  name += ` ${highlight.region.name}`;
  if(!highlight.bins) return name;

  const startBase = _.head(highlight.bins).start;
  const endBase = _.last(highlight.bins).end;
  name += `:${startBase}-${endBase}`;

  return name;
}

function formatHit(hit, x, y) {
  if(_.isNull(hit)) return { x, y, name: 'nothing here' };
  if(!_.isArray(hit)) throw new Error("hit stack must be an array");
  switch(hit.length) {
    case 3: return {
      bins: hit[0],
      region: hit[1],
      genome: hit[2],
      x, y
    };

    case 2: return {
      region: hit[0],
      genome: hit[1],
      x, y
    };

    case 1: return {
      genome: hit[0],
      x, y
    };

    case 0: return { x, y };

    default: throw Error("Expected between 0 and 3 items in the hit stack.");
  }
}

function drawOrGetObjectsFromGenomes(ctx, genomes, metrics, globalStats) {
  genomes.forEach((genome, idx) => {
    const x = metrics.padding;
    const y = idx * metrics.height + metrics.margin;
    drawGenome({genome, genomeCtx: ctx, x, y, globalStats, width: metrics.width, height: metrics.unpaddedHeight});
  });
}

function drawGenome({genome, genomeCtx, x, y, width, height, globalStats}) {
  genomeCtx.pushObject(genome);

  const basesPerPx = genome.fullGenomeSize / width;
  const regions = genome._regionsArray;
  const maxScore = globalStats.bins.max || 0;

  // genomeCtx.fillStyle = 'black';
  // genomeCtx.fillRect(x, y, width, height);

  let binIdx = 0;
  let basesInBinUsedAlready = 0;

  let regionIdx = 0;
  let region = regions[regionIdx];
  let regionUnanchored = region.name === 'UNANCHORED';

  genomeCtx.pushObject(region);

  for (let px = x; px < width + x; px++) {
    let baseCount = 0;
    let pxScore = undefined;
    const bins = [];
    genomeCtx.pushObject(bins);

    while (baseCount < basesPerPx) {
      const basesNeededByThisPixel = basesPerPx - baseCount;
      const bin = region.bin(binIdx);
      const binSize = bin.end - bin.start + 1;
      const binScore = bin.results.count / maxScore;
      const basesAvailableInBin = binSize - basesInBinUsedAlready;
      let binBasesUsed;

      bins.push(bin);

      // did we use all the bases in the bin?
      if (basesAvailableInBin <= basesNeededByThisPixel) {
        // if yes, we'll move on to the next one.
        binIdx++;
        basesInBinUsedAlready = 0;
        binBasesUsed = basesAvailableInBin;
      }
      else {
        // otherwise, track how many bases we have used.
        basesInBinUsedAlready += basesNeededByThisPixel;
        binBasesUsed = basesNeededByThisPixel;
      }

      pxScore = updateScore(pxScore, baseCount, binScore, binBasesUsed);

      baseCount += binBasesUsed;

      // if the new bin index is too big for the region,
      // go to the next region and set bin index to 0
      if (binIdx === region.binCount()) {
        genomeCtx.popObject(); // bins. we'll put this back on again.
        genomeCtx.popObject(); // region
        binIdx = 0;
        ++regionIdx;

        if (regionIdx === regions.length) {
          break;
        }

        region = regions[regionIdx];
        regionUnanchored = region.name === 'UNANCHORED';

        genomeCtx.pushObject(region);
        genomeCtx.pushObject(bins);
      }
    }

    genomeCtx.fillStyle = calcBinColor(regionIdx, pxScore, regionUnanchored);
    genomeCtx.fillRect(px, y, 1, height);
    genomeCtx.popObject(); // bins;
  }

  genomeCtx.popObject(); // genome
}

function updateScore(currentScore, baseCount, binScore, binBasesUsed) {
  let newScore;
  if (_.isNumber(currentScore)) {
    if (baseCount === 0) {
      throw new Error("There should already be bases accounted for in this pixel");
    }
    // weight scores.
    newScore = ((currentScore * baseCount) + (binScore * binBasesUsed)) / (binBasesUsed + baseCount);
  }
  else {
    if (baseCount !== 0) {
      throw new Error("There should already be a color");
    }
    newScore = binScore
  }
  return newScore;
}