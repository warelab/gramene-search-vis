import updateExistingSelection from "./updateExistingSelection";

export default function getUpdatedExistingSelections(existingSelectionsToUpdate, rootNode, newSelection) {
  return existingSelectionsToUpdate
      .reduce((acc, oldSelection) => updateExistingSelection(acc, oldSelection,
                                                             rootNode),
              {updatedNewSelection: newSelection, updatedSelections: []}
      );
}