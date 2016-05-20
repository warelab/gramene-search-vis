import {binColor as calcBinColor} from "../util/colors";
import _ from "lodash";
import {clear} from "../util/canvas";

export function nameFor(highlight) {
  if (!highlight.genome) return 'nothing here';

  let name = highlight.genome.system_name;
  if (!highlight.region) return name;

  name += ` ${highlight.region.name}`;
  if (!highlight.bins) return name;

  const startBase = _.head(highlight.bins).start;
  const endBase = _.last(highlight.bins).end;
  name += `:${startBase}-${endBase}`;

  return name;
}

export function drawGenomes(ctx, genomes, metrics, globalStats) {
  clear(ctx);

  return _(genomes).map((genome, idx) => {
    const x = metrics.padding;
    const y = idx * metrics.height + metrics.margin;
    const xPixels = drawGenome({
                                 genome,
                                 genomeCtx: ctx,
                                 x,
                                 y,
                                 globalStats,
                                 width: metrics.width,
                                 height: metrics.unpaddedHeight
                               });
    return {
      genome,
      xPixels,
      y,
      height: metrics.height
    }
  }).keyBy('y').value();
}

function drawGenome({genome, genomeCtx, x, y, width, height, globalStats}) {
  const basesPerPx = genome.fullGenomeSize / width;
  const regions = genome._regionsArray;
  const maxScore = globalStats.bins.max || 0;

  const pixelInfo = {};

  let binIdx = 0;
  let binFirstPx = x;
  let basesInBinUsedAlready = 0;
  let basesNeededByThisPixel;
  let bin;
  let binSize;
  let binScore;
  let basesAvailableInBin;

  let regionIdx = 0;
  let region = regions[regionIdx];
  let regionDims = {x, width: region.size / basesPerPx};
  let regionUnanchored = region.name === 'UNANCHORED';

  for (let px = x; px < width + x; px++) {
    const pxInfo = {
      bins: [],
      x: binFirstPx,
      region,
      regionDims,
      genome,
      score: undefined,
      baseCount: 0
    };

    while (pxInfo.baseCount < basesPerPx) {
      basesNeededByThisPixel = basesPerPx - pxInfo.baseCount;
      bin = region.bin(binIdx);
      binSize = bin.end - bin.start + 1;
      binScore = bin.results.count / maxScore;
      basesAvailableInBin = binSize - basesInBinUsedAlready;

      pxInfo.bins.push(bin);

      // did we use all the bases in the bin?
      let binBasesUsed;
      if (basesAvailableInBin <= basesNeededByThisPixel) {
        // if yes, we'll move on to the next one.
        binIdx++;
        binFirstPx = px;
        basesInBinUsedAlready = 0;
        binBasesUsed = basesAvailableInBin;
      }
      else {
        // otherwise, track how many bases we have used.
        basesInBinUsedAlready += basesNeededByThisPixel;
        binBasesUsed = basesNeededByThisPixel;
      }

      pxInfo.score = updateScore(pxInfo.score, pxInfo.baseCount, binScore, binBasesUsed);

      pxInfo.baseCount += binBasesUsed;

      // if the new bin index is too big for the region,
      // go to the next region and set bin index to 0
      if (binIdx === region.binCount()) {
        binIdx = 0;
        ++regionIdx;

        if (regionIdx === regions.length) {
          break;
        }

        region = pxInfo.region = regions[regionIdx];
        regionDims = pxInfo.regionDims = {x:px, width: region.size / basesPerPx};
        regionUnanchored = region.name === 'UNANCHORED';
      }
    }

    genomeCtx.fillStyle = calcBinColor(regionIdx, pxInfo.score, regionUnanchored);
    genomeCtx.fillRect(px, y, 1, height);

    pxInfo.width = px - pxInfo.x + Math.ceil(basesAvailableInBin / basesPerPx);
    pixelInfo[px] = pxInfo;
  }

  return pixelInfo;
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