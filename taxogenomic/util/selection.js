import _ from "lodash";
import getSelectionsThatMayNeedUpdating from "./selection/getSelectionsThatMayNeedUpdating";
import getUpdatedExistingSelections from "./selection/getUpdatedExistingSelections";

/* 
 Update global selection state when a new selection is applied.
 */

export function updateSelections(newSelection, currentSelectionState, rootNode) {
  // add or subtract one because we may need to modify selections immediately adjacent.
  const start = _.get(newSelection, 'binFrom.idx') - 1;
  const end = _.get(newSelection, 'binTo.idx') + 1;

  const selections = currentSelectionState.selections;

  // find any existing selections that will be affected by the new one.
  const existingSelectionsToUpdate = getSelectionsThatMayNeedUpdating(selections, start, end);
  const existingSelectionsToKeep = _.difference(
      currentSelectionState.selections,
      existingSelectionsToUpdate
  );

  // modify the new selection and any existing ones that overlap
  // in order to remove overlaps
  const {updatedNewSelection, updatedSelections} =
      getUpdatedExistingSelections(existingSelectionsToUpdate, rootNode, newSelection);


  const newSelections = [
    ...existingSelectionsToKeep,
    ...updatedSelections
  ];

  // only add the new selection if it is a selection and not a deselection.
  if (updatedNewSelection.select) {
    newSelections.push(updatedNewSelection);
  }

  return {selections: newSelections};
}