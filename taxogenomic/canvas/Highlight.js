import _ from 'lodash';
import {clear} from "../util/canvas";

export function drawHighlightsAndSelections(
    highlight, selection, inProgressSelection, 
    ctx, metrics, genomes) {
  clear(ctx);
  
  if(!_.isEmpty(selection)) {
    drawSelections(selection.selections, ctx, metrics, genomes);
  }
  
  if(!_.isEmpty(inProgressSelection)) {
    drawInProgressSelection(
        highlight,
        inProgressSelection,
        ctx,
        metrics,
        genomes
    );
  }
  else {
    drawHighlight(
        highlight,
        ctx,
        metrics,
        genomes
    );
  }
}

function drawSelections(selections, ctx, metrics, genomes) {
  _(selections)
      .filter((selection) => selection.select)
      .forEach((selection)=> {
    if (isSelectionBad(selection)) return;

    const {genome, binFrom, binTo, x, width} = selection;
    const yRange = getGenomeYRange(genome, genomes, metrics);

    ctx.strokeStyle = 'red';
    ctx.strokeRect(x - 1, yRange.y - 1, width + 1, yRange.height + 1);
  });
}

function drawHighlight(highlight, ctx, metrics, genomes) {
  if (isHighlightBad(highlight)) return;

  const {genome, bins, x} = highlight;

  const xRange = getBinXRange(genome, bins, metrics, x);
  const yRange = getGenomeYRange(genome, genomes, metrics);

  // ctx.strokeStyle = '#ea8e75';
  ctx.strokeStyle = 'red';
  ctx.strokeRect(xRange.x - 1, yRange.y - 1, xRange.width + 1, yRange.height + 1);
}

function drawInProgressSelection(highlight, inProgressSelection, ctx, metrics, genomes) {
  if (isHighlightBad(highlight)) return;
  if (isSelectionBad(inProgressSelection)) return;

  const yRange = getGenomeYRange(highlight.genome, genomes, metrics);
  const xRange = { 
    x: Math.min(highlight.x, inProgressSelection.x) - 1,
    width: Math.abs(highlight.x - inProgressSelection.x) + 2
  };

  // ctx.strokeStyle = '#ea8e75';
  ctx.strokeStyle = 'red';
  ctx.strokeRect(xRange.x - 1, yRange.y - 1, xRange.width + 1, yRange.height + 1);
}

function getGenomeYRange(genome, genomes, metrics) {
  if (genome) {
    const height = metrics.height - metrics.padding;
    let y = metrics.margin;
    for (let i = 0; i < genomes.length; i++) {
      const g = genomes[i];
      if (g.taxon_id === genome.taxon_id) {
        return {y: y, height: height};
      }
      y += metrics.height;
    }
  }
  return undefined;
}

function getBinXRange(genome, bins, metrics, x) {
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

function isHighlightBad(highlight) {
  return !highlight || !highlight.genome || !highlight.bins || !highlight.bins.length;
}

function isSelectionBad(sel) {
  return !sel || !sel.genome || !sel.binTo || !sel.binFrom;
}