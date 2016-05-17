import _ from "lodash";

/* 
 Update global selection state when a new selection is applied.
 */
export function updateSelections(newSelection, currentSelectionState, rootNode) {
  const start = _.get(newSelection, 'binFrom.idx');
  const end = _.get(newSelection, 'binTo.idx');

  if (_.isUndefined(newSelection.select)) {
    throw new Error("Must specify selection state");
  }

  if (!(_.isNumber(start) && _.isNumber(end))) {
    throw new Error("Selection must specify binFrom and binTo");
  }

  if(end < start) {
    throw new Error("Malformed selection: binTo is before binFrom");
  }

  const bins = _.clone(currentSelectionState.bins) || {};

  // update any existing selections that will be affected by the new one.
  const existingSelectionsToUpdate = _(bins).pickBy((selection, binIdx)=> binIdx >= start && binIdx <= end)
                                            .values()
                                            .uniq()
                                            .value();

  const existingSelectionsToKeep = _.difference(
      currentSelectionState.selections,
      existingSelectionsToUpdate
  );

  // nb updateOldSelection *may* modify newSelection.
  const updatedSelections = existingSelectionsToUpdate
      .reduce((acc, oldSelection) => updateOldSelection(acc, oldSelection,
                                                    newSelection,
                                                    bins,
                                                    start,
                                                    end,
                                                    rootNode)
      , []);

  // fill the selected area
  fillBins(bins, newSelection);

  const selections = [
    ...existingSelectionsToKeep,
    ...updatedSelections,
    newSelection
  ];

  return {selections, bins};
}

function updateOldSelection(acc, oldSelection, newSelection, bins, start, end, rootNode) {
  const {binFrom: {idx: oldStartIdx}, binTo: {idx: oldEndIdx}} = oldSelection;
  const {binFrom: {idx: newStartIdx}, binTo: {idx: newEndIdx}} = newSelection;

  /*
   If overlapping selections are the same type (e.g. both have "select" === true)
   Then we should merge them into the new selection.
   */
  if (oldSelection.select === newSelection.select) {
    if (oldSelection.binFrom.idx < newSelection.binFrom.idx) {
      newSelection.binFrom = oldSelection.binFrom;
    }
    if (oldSelection.binTo.idx > newSelection.binTo.idx) {
      newSelection.binTo = oldSelection.binTo;
    }
  }

  /* otherwise, handle the disjunctions */

  /* case 1. completely overwrite
   oldSelection:       |-------------|    or        |-----|
   newSelection:       |-------------|           |-----------|

   updatedSelections:  < none >
   */
  else if (oldStartIdx >= newStartIdx && oldEndIdx <= newEndIdx) {
    // do nothing
  }

  else {
    /* NB it's possible for both of the following conditions to be true */

    /* case 2: newSelection overwrites end of old selection
     oldSelection:       |-------------|
     newSelection:               |---------...
     updatedSelections:  |------|           
     */
    if (oldStartIdx < newStartIdx && oldEndIdx >= newStartIdx) {
      const updatedEndIdx = newStartIdx - 1;
      const updatedEnd = rootNode.getBin(updatedEndIdx);
      const updatedSelection = _.clone(oldSelection);
      updatedSelection.binTo = updatedEnd;
      updatedSelection.width = newSelection.x - oldSelection.x;

      acc.push(updatedSelection);

      fillBins(bins, updatedSelection);
    }

    /* case 3: newSelection overwrites start of oldSelection
     oldSelection:               |------------|
     newSelection:       ...-----------|
     updatedSelections:                 |-----|           
     */
    if (oldStartIdx < newEndIdx && oldEndIdx >= newEndIdx) {
      const updatedStartIdx = newEndIdx + 1;
      const updatedStart = rootNode.getBin(updatedStartIdx);
      const updatedSelection = _.clone(oldSelection);
      updatedSelection.binFrom = updatedStart;
      updatedSelection.x = newSelection.x + newSelection.width + 1;
      updatedSelection.width = oldSelection.width + oldSelection.x - updatedSelection.x;

      acc.push(updatedSelection);

      fillBins(bins, updatedSelection);
    }
  }

  return acc;
}

function fillBins(bins, obj, start = obj.binFrom.idx, end = obj.binTo.idx) {
  for (let i = start; i <= end; i++) {
    bins[i] = obj;
  }
}