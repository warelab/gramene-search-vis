import _ from "lodash";
import getSelectionsThatMayNeedUpdating from "./selection/getSelectionsThatMayNeedUpdating";
import getUpdatedExistingSelections from "./selection/getUpdatedExistingSelections";

/* 
 Update global selection state when a new selection is applied.
 */

export function updateSelections(newSelection, currentSelectionState, rootNode) {

  // find any existing selections that will be affected by the new one.
  const {toUpdate, toLeave} = getSelectionsThatMayNeedUpdating(currentSelectionState, newSelection);
  
  // modify the new selection and any existing ones that overlap
  // in order to remove overlaps
  const {modifiedNewSelection, updated} =
      getUpdatedExistingSelections(toUpdate, rootNode, newSelection);
  
  const newSelections = [
    ...toLeave,
    ...updated
  ];

  // add the new selection if it is a selection (i.e. not a deselection).
  if (modifiedNewSelection.select) {
    newSelections.push(modifiedNewSelection);
  }

  return newSelections;
}