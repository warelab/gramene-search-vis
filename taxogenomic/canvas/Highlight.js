import _ from "lodash";
import {clear} from "../util/canvas";

export function drawHighlightsAndSelections(highlight, selection, 
                                            inProgressSelection, ctx) {
  clear(ctx);

  if (!_.isEmpty(selection)) {
    drawSelections(selection.selections, ctx);
  }

  if (!_.isEmpty(inProgressSelection)) {
    drawInProgressSelection(
        highlight,
        inProgressSelection,
        ctx
    );
  }
  else {
    drawHighlight(
        highlight,
        ctx
    );
  }
}

function drawSelections(selections, ctx) {
  _(selections)
      .filter((selection) => selection.select)
      .forEach((selection)=> {
        if (isSelectionBad(selection)) return;

        const {x, width, y, height} = selection;

        ctx.strokeStyle = 'red';
        ctx.strokeRect(x - 1, y - 1, width + 1, height);
      });
}

function drawHighlight(highlight, ctx) {
  if (isHighlightBad(highlight)) return;

  const {x, width, y, height} = highlight;

  ctx.strokeStyle = 'green';
  ctx.strokeRect(x - 1, y - 1, width + 1, height);
}

function drawInProgressSelection(highlight, inProgressSelection, ctx) {
  if (isHighlightBad(highlight)) return;
  if (isSelectionBad(inProgressSelection)) return;

  let start, end;
  if(_.head(highlight.bins).idx > inProgressSelection.binFrom.idx) {
    start = inProgressSelection;
    end = highlight;
  }
  else {
    start = highlight;
    end = inProgressSelection;
  }

  const {y, height} = highlight;
  const xRange = {
    x: Math.min(start.x, end.x) - 1,
    width: end.x - start.x + end.width + 2
  };

  ctx.strokeStyle = 'green';
  ctx.strokeRect(xRange.x - 1, y - 1, xRange.width + 1, height);
}

function isHighlightBad(highlight) {
  return !highlight || !highlight.genome || !highlight.bins || !highlight.bins.length;
}

function isSelectionBad(sel) {
  return !sel || !sel.genome || !sel.binTo || !sel.binFrom;
}