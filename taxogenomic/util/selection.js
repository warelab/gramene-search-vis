import _ from "lodash";

/* 
 Update global selection state when a new selection is applied.
 */

export function updateSelections(newSelection, currentSelectionState, rootNode) {
  // add or subtract one because we are interested
  const start = _.get(newSelection, 'binFrom.idx') - 1;
  const end = _.get(newSelection, 'binTo.idx') + 1;

  checkForObviousErrors(newSelection, start, end);

  const bins = _.clone(currentSelectionState.bins) || {};

  // find any existing selections that will be affected by the new one.
  const existingSelectionsToUpdate = getSelectionsThatMayNeedUpdating(bins, start, end);
  const existingSelectionsToKeep = _.difference(
      currentSelectionState.selections,
      existingSelectionsToUpdate
  );

  // modify the new selection and any existing ones that overlap
  // in order to remove overlaps
  const {updatedNewSelection, updatedSelections} =
      getUpdatedExistingSelections(existingSelectionsToUpdate, bins, start, end, rootNode, newSelection);

  // fill the selected area
  fillBins(bins, updatedNewSelection);

  const selections = [
    ...existingSelectionsToKeep,
    ...updatedSelections,
    updatedNewSelection
  ];

  return {selections, bins};
}

function checkForObviousErrors(newSelection, start, end) {
  if (_.isUndefined(newSelection.select)) {
    throw new Error("Must specify selection state");
  }

  if (!(_.isNumber(start) && _.isNumber(end))) {
    throw new Error("Selection must specify binFrom and binTo");
  }

  if(end < start) {
    throw new Error("Malformed selection: binTo is before binFrom");
  }
}

function getSelectionsThatMayNeedUpdating(bins, start, end) {
  return _(bins).pickBy((selection, binIdx)=> binIdx >= start && binIdx <= end)
                .values()
                .uniq()
                .value();
}

function getUpdatedExistingSelections(existingSelectionsToUpdate, bins, start, end, rootNode, newSelection) {
  return existingSelectionsToUpdate
      .reduce((acc, oldSelection) => updateExistingSelection(acc, oldSelection,
                                                             bins,
                                                             start,
                                                             end,
                                                             rootNode),
              {updatedNewSelection: newSelection, updatedSelections: []}
      );
}

function updateExistingSelection(acc, oldSelection, bins, start, end, rootNode) {
  const newSelection = acc.updatedNewSelection;
  const {binFrom: {idx: oldStartIdx}, binTo: {idx: oldEndIdx}} = oldSelection;
  const {binFrom: {idx: newStartIdx}, binTo: {idx: newEndIdx}} = newSelection;

  /*
   If overlapping or adjacent selections are the same type (e.g. both have "select" === true)
   Then we should merge them into the new selection.
   */
  if (oldSelection.select === newSelection.select) {
    const updatedNewSelection = _.clone(newSelection);

    if (oldSelection.binFrom.idx < newSelection.binFrom.idx) {
      updatedNewSelection.binFrom = oldSelection.binFrom;
      updatedNewSelection.x = oldSelection.x;
      updatedNewSelection.width = updatedNewSelection.width + newSelection.x - oldSelection.x;
    }
    if (oldSelection.binTo.idx > newSelection.binTo.idx) {
      updatedNewSelection.binTo = oldSelection.binTo;
      updatedNewSelection.width = oldSelection.width + oldSelection.x - updatedNewSelection.x;
    }

    acc.updatedNewSelection = updatedNewSelection;
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
      const updatedSelectionBefore = _.clone(oldSelection);
      updatedSelectionBefore.binTo = updatedEnd;
      updatedSelectionBefore.width = newSelection.x - oldSelection.x;

      acc.updatedSelections.push(updatedSelectionBefore);

      fillBins(bins, updatedSelectionBefore);
    }

    /* case 3: newSelection overwrites start of oldSelection
     oldSelection:               |------------|
     newSelection:       ...-----------|
     updatedSelections:                 |-----|           
     */
    if (oldStartIdx < newEndIdx && oldEndIdx >= newEndIdx) {
      const updatedStartIdx = newEndIdx + 1;
      const updatedStart = rootNode.getBin(updatedStartIdx);
      const updatedSelectionAfter = _.clone(oldSelection);
      updatedSelectionAfter.binFrom = updatedStart;
      updatedSelectionAfter.x = newSelection.x + newSelection.width;
      updatedSelectionAfter.width = (oldSelection.x + oldSelection.width) - updatedSelectionAfter.x;

      acc.updatedSelections.push(updatedSelectionAfter);

      fillBins(bins, updatedSelectionAfter);
    }
  }

  return acc;
}

function fillBins(bins, obj, start = obj.binFrom.idx, end = obj.binTo.idx) {
  for (let i = start; i <= end; i++) {
    bins[i] = obj;
  }
}