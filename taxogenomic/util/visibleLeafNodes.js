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
    const di = displayInfo[n.model.id];
    if(!di) {
      throw new Error(`No display info for node ${n.model.id}`);
    }
    if(di.expanded) {
      // if a node has no children, it's a leaf node (with a reference genome)
      if (!n.hasChildren()) {
        if (!n.model.genome) {
          throw new Error(`Node ${_.get(n, 'model.id')} has no genome`);
        }
        leaves.push(n);
      }

      return true;
    }
  });
  return leaves;
}