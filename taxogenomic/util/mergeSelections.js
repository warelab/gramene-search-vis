import _ from "lodash";

export default function mergeSelections(start, end) {
  checkSelection(start);
  checkSelection(end);
  checkSelectionsOnSameGenome(start, end);
  let first, last;

  if (start.binFrom.idx < end.binFrom.idx) {
    first = start;
    last = end;
  }
  else {
    first = end;
    last = start;
  }

  const selection = _.omit(first, ['binFrom', 'binTo', 'x']);

  selection.binFrom = first.binFrom;
  selection.binTo = last.binTo;
  selection.x = first.x;
  selection.width = last.x - first.x + last.width + 1;

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