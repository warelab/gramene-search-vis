import pickBy from 'lodash/pickBy';

export default function pickNumericKeys(object, first, last) {
  return pickBy(object, (bin, idx)=> idx >= first && idx <= last);
}