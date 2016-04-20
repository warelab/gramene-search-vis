export default function visibleLeafNodeCount(taxonomy, displayInfo) {
  var count;

  if(displayInfo) {
    count = 0;
    taxonomy.filterWalk(function (n) {
      // if a node has no children, it's a leaf node (with a reference genome)
      if(!n.hasChildren()) {
        if(!n.model.genome) {
          throw new Error(`Node ${_.get(n, 'model.id')} has no genome`);
        }
        ++count;
      }

      // only look at the children if they are visible in the chart.
      return displayInfo[n.model.id].expanded;
    }.bind(this));
  }
  else {
    count = taxonomy.leafNodes().length;
  }

  return count;
}