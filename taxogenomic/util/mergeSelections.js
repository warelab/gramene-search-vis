import _ from "lodash";

export default function mergeSelections(start, end) {
  checkSelection(start);
  checkSelection(end);
  checkSelectionsOnSameGenome(start, end);
  
  const selection = _.omit(start, ['binFrom', 'binTo']);
  if(start.binFrom.idx < end.binFrom.idx) {
    selection.binFrom = start.binFrom;
    selection.binTo = end.binTo;
  }
  else {
    selection.binFrom = end.binFrom;
    selection.binTo = start.binTo;
  }
  return selection;
}

function checkSelection(s) {
  if (!s || !_.isObject(s) || !s.genome || !s.region || !s.binFrom || !s.binTo)
    throw Error("Selection object invalid", s);
}

function checkSelectionsOnSameGenome(start, end) {
  if (!_.isNumber(start.genome.taxon_id) || !_.isEqual(start.genome.taxon_id, end.genome.taxon_id)) {
    throw new Error("Selection start and end are on different genomes");
  }
}