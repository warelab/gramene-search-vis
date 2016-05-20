import _ from 'lodash';

// check for errors that would indicate some other logic
// needs to be refactored.
export default function checkForObviousErrors(newSelection, start, end) {
  if(!_.isObject(newSelection)) {
    throw new Error("Must provide selection object");
  }
  
  if (_.isUndefined(newSelection.select)) {
    throw new Error("Must specify selection state");
  }

  if (!(_.isFinite(start) && _.isFinite(end))) {
    throw new Error("Selection must specify binFrom and binTo");
  }

  if (end < start) {
    throw new Error("Malformed selection: binTo is before binFrom");
  }
}