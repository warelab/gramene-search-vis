import _ from 'lodash';

export default function getSelectionsThatMayNeedUpdating(selections, newSelection) {
  // add or subtract one because we may need to modify selections immediately adjacent.
  const start = newSelection.binFrom.idx - 1;
  const end = newSelection.binTo.idx + 1;
  const taxonId = newSelection.genome.taxon_id;

  const partitioned = _.partition(selections, (selection) => {
    const from = _.get(selection.binFrom, 'idx');
    const to = _.get(selection.binTo, 'idx');
    return taxonId === _.get(selection.genome, 'taxon_id')
        && !(from > end || to < start);
  });

  return { 
    toUpdate: partitioned[0], 
    toLeave: partitioned[1] 
  };
}