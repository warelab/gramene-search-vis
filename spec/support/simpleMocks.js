import _ from 'lodash';

const PX_PER_BIN_EXAMPLE = 2;

const bin = (idx) => ({idx: idx});
const sel = (fromIdx, toIdx, name, select = true, taxon_id = 1) => ({
  select,
  name,
  genome: { taxon_id },
  binFrom: bin(fromIdx),
  binTo: bin(toIdx),
  x: (fromIdx - 1) * PX_PER_BIN_EXAMPLE,
  width: (toIdx - fromIdx + 1) * PX_PER_BIN_EXAMPLE
});
const rootNode = {
  getBin: bin
};
const acc = (fromIdx, toIdx, name, state) => ({
  updatedNewSelection: sel(fromIdx, toIdx, name, state), 
  updatedSelections: []
});

export { bin, sel, rootNode, acc }; 