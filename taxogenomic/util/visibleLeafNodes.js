export function visibleLeafNodeCount(taxonomy, displayInfo) {
  return visibleLeafNodes(taxonomy, displayInfo).length;
}

export function visibleLeafNodes(taxonomy, displayInfo) {
  if(displayInfo) {
    return walkTreeForVisibleLeaves(taxonomy, displayInfo);
  }
  else {
    return taxonomy.leafNodes();
  }
}

function walkTreeForVisibleLeaves(taxonomy, displayInfo) {
  const leaves = [];
  taxonomy.filterWalk((n) => {
    // if a node has no children, it's a leaf node (with a reference genome)
    if(!n.hasChildren()) {
      if(!n.model.genome) {
        throw new Error(`Node ${_.get(n, 'model.id')} has no genome`);
      }
      leaves.push(n);
    }

    // only look at the children if they are visible in the chart.
    return displayInfo[n.model.id].expanded;
  });
  return leaves;
}