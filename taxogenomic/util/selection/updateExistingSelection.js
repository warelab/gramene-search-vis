import mergeOldSelectionIntoNew from "./mergeOldSelectionIntoNew";
import {trimEndOfExistingSelection, trimStartOfExistingSelection} from "./trimExistingSelection";

export default function updateExistingSelection(acc, oldSelection, rootNode) {
  const newSelection = acc.updatedNewSelection;
  const {genome: {taxon_id: oldTaxonId}, binFrom: {idx: oldStartIdx}, binTo: {idx: oldEndIdx}} = oldSelection;
  const {genome: {taxon_id: newTaxonId}, binFrom: {idx: newStartIdx}, binTo: {idx: newEndIdx}} = newSelection;

  if( oldTaxonId !== newTaxonId
      || (oldEndIdx + 1 < newStartIdx && oldStartIdx < newStartIdx)
      || (oldStartIdx - 1 > newEndIdx && oldEndIdx > newEndIdx)) {
    throw new Error("Selections don't overlap/are not adjacent");
  }
  
  /*
   If overlapping or adjacent selections are the same
   type (e.g. both have "select" === true) and are on
   the same genome, then we should merge them into the
   new selection.
   */
  if (oldSelection.select === newSelection.select) {
    acc.updatedNewSelection =
        mergeOldSelectionIntoNew(newSelection, oldSelection);
  }

  /* otherwise, handle the disjunctions */

  /* case 1. completely overwrite
   oldSelection:       |-------------|    or        |-----|
   newSelection:       |-------------|           |-----------|

   updatedSelections:  < none >
   */
  else if (oldStartIdx >= newStartIdx && oldEndIdx <= newEndIdx) {
    // add no updated selection, i.e. do nothing here.
  }

  else {
    /* NB it's possible for both of the following conditions to be true */

    /* case 2: newSelection overwrites end of old selection
     oldSelection:       |-------------|
     newSelection:               |---------...
     updatedSelections:  |------|
     */
    if (oldStartIdx < newStartIdx && oldEndIdx >= newStartIdx) {
      acc.updatedSelections.push(
          trimEndOfExistingSelection(newSelection, oldSelection, rootNode)
      );
    }

    /* case 3: newSelection overwrites start of oldSelection
     oldSelection:               |------------|
     newSelection:       ...-----------|
     updatedSelections:                 |-----|
     */
    if (oldStartIdx <= newEndIdx && oldEndIdx > newEndIdx) {
      acc.updatedSelections.push(
          trimStartOfExistingSelection(newSelection, oldSelection, rootNode)
      );
    }
  }

  return acc;
}