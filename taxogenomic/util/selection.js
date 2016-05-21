import _ from "lodash";
import getSelectionsThatMayNeedUpdating from "./selection/getSelectionsThatMayNeedUpdating";
import getUpdatedExistingSelections from "./selection/getUpdatedExistingSelections";

/* 
 Update global selection state when a new selection is applied.
 */

export function updateSelections(newSelection, currentSelectionState, rootNode) {
  const selections = currentSelectionState.selections;

  // find any existing selections that will be affected by the new one.
  const selectionsToUpdate = getSelectionsThatMayNeedUpdating(selections, newSelection);
  const selectionsToLeaveUnchanged = _.difference(
      selections,
      selectionsToUpdate
  );

  // modify the new selection and any existing ones that overlap
  // in order to remove overlaps
  const {updatedNewSelection, updatedSelections} =
      getUpdatedExistingSelections(selectionsToUpdate, rootNode, newSelection);
  
  const newSelections = [
    ...selectionsToLeaveUnchanged,
    ...updatedSelections
  ];

  // add the new selection if it is a selection (i.e. not a deselection).
  if (updatedNewSelection.select) {
    newSelections.push(updatedNewSelection);
  }

  return {selections: newSelections};
}