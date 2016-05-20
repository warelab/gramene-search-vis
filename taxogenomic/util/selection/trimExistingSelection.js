import _ from "lodash";

export function trimEndOfExistingSelection(newSelection, oldSelection, rootNode) {
  commonChecks(oldSelection, newSelection);

  const updatedEndIdx = newSelection.binFrom.idx - 1;

  if(updatedEndIdx < oldSelection.binFrom.idx) {
    throw new Error("Cannot end selection before it starts");
  }
  const updatedEnd = rootNode.getBin(updatedEndIdx);
  const updatedSelectionBefore = _.clone(oldSelection);
  updatedSelectionBefore.binTo = updatedEnd;
  updatedSelectionBefore.width = newSelection.x - oldSelection.x;

  return updatedSelectionBefore;
}

export function trimStartOfExistingSelection(newSelection, oldSelection, rootNode) {
  commonChecks(oldSelection, newSelection);

  const updatedStartIdx = newSelection.binTo.idx + 1;
  if(updatedStartIdx > oldSelection.binTo.idx) {
    throw new Error("Cannot start selection after it ends");
  }

  const updatedStart = rootNode.getBin(updatedStartIdx);
  const updatedSelectionAfter = _.clone(oldSelection);
  updatedSelectionAfter.binFrom = updatedStart;
  updatedSelectionAfter.x = newSelection.x + newSelection.width;
  updatedSelectionAfter.width = (oldSelection.x + oldSelection.width) - updatedSelectionAfter.x;

  return updatedSelectionAfter;
}

function commonChecks(oldS, newS) {

  if (oldS.select === newS.select) {
    throw new Error("These selections should be merged!");
  }
  if (newS.binFrom.idx < oldS.binFrom.idx && newS.binTo.idx > oldS.binTo.idx) {
    throw new Error("Old bin should be removed, not trimmed");
  }

  if (newS.binFrom.idx > oldS.binTo.idx ||
      newS.binTo.idx < oldS.binFrom.idx) {
    throw new Error("No appropriate overlap for trim");
  }
}