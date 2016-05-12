import {binColor as calcBinColor} from "../util/colors";
import _ from 'lodash';

export function drawGenome({genome, ctx, x, y, width, height, globalStats}) {
  const basesPerPx = genome.fullGenomeSize / width;
  const regions = genome._regionsArray;
  const maxScore = globalStats.bins.max || 0;

  // ctx.fillStyle = 'black';
  // ctx.fillRect(x, y, width, height);

  let binIdx = 0;
  let basesInBinUsedAlready = 0;

  let regionIdx = 0;
  let region = regions[regionIdx];
  let regionUnanchored = region.name === 'UNANCHORED';

  for (let px = x; px < width + x; px++) {
    let baseCount = 0;
    let pxScore = undefined;

    while (baseCount < basesPerPx) {
      const basesNeededByThisPixel = basesPerPx - baseCount;
      const bin = region.bin(binIdx);
      const binSize = bin.end - bin.start + 1;
      const binScore = bin.results.count / maxScore;
      const basesAvailableInBin = binSize - basesInBinUsedAlready;
      let binBasesUsed;

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
        binIdx = 0;
        ++regionIdx;

        if(regionIdx === regions.length) {
          break;
        }

        region = regions[regionIdx];
        regionUnanchored = region.name === 'UNANCHORED';
      }
    }

    ctx.fillStyle = calcBinColor(regionIdx, pxScore, regionUnanchored);
    ctx.fillRect(px, y, 1, height);
  }
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