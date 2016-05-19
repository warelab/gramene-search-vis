import _ from "lodash";

describe('selection.js', () => {

  // simple mocks:
  const bin = (idx) => ({idx: idx});
  const PX_PER_BIN_EXAMPLE = 2;
  const sel = (fromIdx, toIdx, name, state) => ({
    select: _.isUndefined(state) ? true : state,
    name,
    binFrom: bin(fromIdx),
    binTo: bin(toIdx),
    x: (fromIdx - 1) * PX_PER_BIN_EXAMPLE,
    width: (toIdx - fromIdx + 1) * PX_PER_BIN_EXAMPLE
  });

  let initialSelectionState;
  let rootNode = {
    getBin: bin,
    binCount: () => 100
  };
  let updateSelections;

  beforeEach(() => {
    updateSelections = require('../../taxogenomic/util/selection').updateSelections;
    initialSelectionState = {selections: []};
  });

  it('should correctly add a single selection', () => {
    // given
    var newSel = sel(1, 3, 'simple');

    // when
    var newState = updateSelections(newSel, initialSelectionState, rootNode);

    // then
    expect(_.size(newState.selections)).toEqual(1);
    expect(newState.selections[0]).toEqual(newSel);
  });

  it('should correctly add a second non-overlapping selection', () => {
    // given
    var sel1 = sel(1, 3, 'simple');
    var state1 = updateSelections(sel1, initialSelectionState, rootNode);

    // when
    var sel2 = sel(5, 6, 'simple2');
    var state2 = updateSelections(sel2, state1, rootNode);

    // then
    expect(_.size(state2.selections)).toEqual(2);
    expect(state2.selections[0]).toEqual(sel1);
  });

  it('should correctly add a second completely overlapping selection', function () {
    // given
    var sel1 = sel(1, 4, 'simple');
    var state1 = updateSelections(sel1, initialSelectionState, rootNode);

    // when
    var sel2 = sel(2, 3, 'simple2');
    var state2 = updateSelections(sel2, state1, rootNode);

    var resultingSelection = sel(1, 4, 'simple2');

    // then
    expect(_.size(state2.selections)).toEqual(1);
    expect(state2.selections[0]).toEqual(resultingSelection);
  });

  it('should correctly add a selection that completely overlaps an inverse one.', function () {
    // given
    var sel1 = sel(1, 4, 'simple');
    var state1 = updateSelections(sel1, initialSelectionState, rootNode);

    // when
    var sel2 = sel(2, 3, 'simple2', false);
    var state2 = updateSelections(sel2, state1, rootNode);

    // then
    expect(_.size(state2.selections)).toEqual(2);
    expect(_.head(state2.selections)).toEqual(sel(1, 1, 'simple'));
    expect(_.last(state2.selections)).toEqual(sel(4, 4, 'simple'));
  });

  it('should correctly add a selection that overlaps the end of an inverse one.', function () {
    // given
    var sel1 = sel(1, 4, 'simple');
    var state1 = updateSelections(sel1, initialSelectionState, rootNode);

    // when
    var sel2 = sel(3, 6, 'simple2', false);
    var state2 = updateSelections(sel2, state1, rootNode);

    // then
    const expected = sel(1, 2, 'simple');
    expect(_.size(state2.selections)).toEqual(1);
    expect(_.last(state2.selections)).toEqual(expected);
  });

  it('should correctly add a selection that completely overlaps all previous selections', function () {
    // given
    var sel1 = sel(1, 4, 'simple', false);
    var state1 = updateSelections(sel1, initialSelectionState, rootNode);
    var sel2 = sel(2, 3, 'simple2');
    var state2 = updateSelections(sel2, state1, rootNode);
    var sel3 = sel(1, 5, 'simple3');
    var state3 = updateSelections(sel3, state2, rootNode);

    // then
    expect(_.size(state3.selections)).toEqual(1);
    expect(_.last(state3.selections)).toEqual(sel3);
  });

  it('should merge two selections that are adjacent', function () {
    // given
    var sel1 = sel(1, 4, 'simple');
    var state1 = updateSelections(sel1, initialSelectionState, rootNode);

    // when
    var sel2 = sel(5, 8, 'simple2');
    var state2 = updateSelections(sel2, state1, rootNode);

    // then
    var expected = sel(1,8,'simple2');
    expect(_.size(state2.selections)).toEqual(1);
    expect(_.last(state2.selections)).toEqual(expected);
  });
});


