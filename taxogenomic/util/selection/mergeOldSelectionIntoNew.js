import _ from 'lodash';

export default function mergeOldSelectionIntoNew(newSelection, oldSelection) {
  if (oldSelection.select !== newSelection.select) {
    throw new Error("Can only merge selections if they are both the same type");
  }
  
  const {binFrom: {idx: oldStartIdx}, binTo: {idx: oldEndIdx}} = oldSelection;
  const {binFrom: {idx: newStartIdx}, binTo: {idx: newEndIdx}} = newSelection;

  const updatedNewSelection = _.clone(newSelection);

  if (oldStartIdx < newStartIdx) {
    if(oldEndIdx + 1 < newStartIdx) {
      throw new Error("Selections don't overlap/are not adjacent");
    }
    updatedNewSelection.binFrom = oldSelection.binFrom;
    updatedNewSelection.x = oldSelection.x;
    updatedNewSelection.width = updatedNewSelection.width + newSelection.x - oldSelection.x;
  }
  if (oldEndIdx > newEndIdx) {
    if(oldStartIdx - 1 > newEndIdx) {
      throw new Error("Selections don't overlap/are not adjacent");
    }
    updatedNewSelection.binTo = oldSelection.binTo;
    updatedNewSelection.width = oldSelection.width + oldSelection.x - updatedNewSelection.x;
  }
  
  return updatedNewSelection;
}