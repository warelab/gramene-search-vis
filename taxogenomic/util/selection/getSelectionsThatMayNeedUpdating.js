import _ from 'lodash';

export default function getSelectionsThatMayNeedUpdating(selections, start, end) {
  return _.filter(selections, (selection) => {
    const from = _.get(selection.binFrom, 'idx');
    const to = _.get(selection.binTo, 'idx');
    return !(from > end || to < start);
  });
}