import _ from "lodash";
import updateExistingSelection from "../../taxogenomic/util/selection/updateExistingSelection";
import {sel, rootNode, acc} from "../support/simpleMocks";

describe('updateExistingSelection', () => {

  let trimExistingSelection, mergeOldSelectionIntoNew;

  beforeEach(() => {
    // use old require syntax to spy on the methods.
    trimExistingSelection = require('../../taxogenomic/util/selection/trimExistingSelection');
    mergeOldSelectionIntoNew = require('../../taxogenomic/util/selection/mergeOldSelectionIntoNew');
    spyOn(trimExistingSelection, 'trimEndOfExistingSelection').and.callThrough();
    spyOn(trimExistingSelection, 'trimStartOfExistingSelection').and.callThrough();
    spyOn(mergeOldSelectionIntoNew, 'default').and.callThrough();
  });

  it('should call trim end when appropriate', () => {
    // given
    const accumulator = acc(10, 20, 'new', false);
    const oldSelection = sel(1, 15, 'old');

    // when
    updateExistingSelection(
        accumulator,
        oldSelection,
        rootNode
    );

    // then
    const {modifiedNewSelection} = accumulator;
    const updatedSelection = _.head(accumulator.updated);
    expect(modifiedNewSelection).toEqual(sel(10, 20, 'new', false));
    expect(updatedSelection).toEqual(sel(1, 9, 'old'));
    expect(trimExistingSelection.trimEndOfExistingSelection).toHaveBeenCalled();
    expect(trimExistingSelection.trimStartOfExistingSelection).not.toHaveBeenCalled();
    expect(mergeOldSelectionIntoNew.default).not.toHaveBeenCalled();
  });

  it('should call trim start when appropriate', () => {
    // given
    const accumulator = acc(1, 20, 'new', false);
    const oldSelection = sel(15, 42, 'old');

    // when
    updateExistingSelection(
        accumulator,
        oldSelection,
        rootNode
    );

    // then
    const {modifiedNewSelection} = accumulator;
    const updatedSelection = _.head(accumulator.updated);
    expect(updatedSelection).toEqual(sel(21, 42, 'old'));
    expect(modifiedNewSelection).toEqual(sel(1, 20, 'new', false));
    expect(trimExistingSelection.trimEndOfExistingSelection).not.toHaveBeenCalled();
    expect(trimExistingSelection.trimStartOfExistingSelection).toHaveBeenCalled();
    expect(mergeOldSelectionIntoNew.default).not.toHaveBeenCalled();
  });

  it('should merge selections when appropriate', () => {
    // given
    const accumulator = acc(10, 20, 'new');
    const oldSelection = sel(1, 15, 'old');

    // when
    updateExistingSelection(
        accumulator,
        oldSelection,
        rootNode
    );

    // then
    const {modifiedNewSelection} = accumulator;
    const updatedSelection = _.head(accumulator.updated);
    expect(updatedSelection).toBeUndefined();
    expect(modifiedNewSelection).toEqual(sel(1, 20, 'new'));
    expect(trimExistingSelection.trimEndOfExistingSelection).not.toHaveBeenCalled();
    expect(trimExistingSelection.trimStartOfExistingSelection).not.toHaveBeenCalled();
    expect(mergeOldSelectionIntoNew.default).toHaveBeenCalled();
  });

  it('should not merge if selections are not overlapping or adjacent', () => {
    // given
    const accumulator = acc(1, 10, 'new');
    const oldSelection = sel(20, 30, 'old');
    const updateFn = () => updateExistingSelection(
        accumulator,
        oldSelection,
        rootNode
    );

    expect(updateFn).toThrow(new Error("Selections don't overlap/are not adjacent"));
  });

  it('should not merge if selections are adjacent but on different genomes', () => {
    // given
    const accumulator = acc(1, 19, 'new');
    const oldSelection = sel(20, 30, 'old', true, 2);
    const updateFn = () => updateExistingSelection(
        accumulator,
        oldSelection,
        rootNode
    );
    
    expect(updateFn).toThrow(new Error("Selections don't overlap/are not adjacent"));
  });

  it('should not trim if selections are not overlapping or adjacent', () => {
    // given
    const accumulator = acc(1, 10, 'new', false);
    const oldSelection = sel(20, 30, 'old');
    const updateFn = () => updateExistingSelection(
        accumulator,
        oldSelection,
        rootNode
    );

    expect(updateFn).toThrow(new Error("Selections don't overlap/are not adjacent"));
  });

  it('should correctly chop of the last bin', () => {
    // given
    const accumulator = acc(10, 10, 'new', false);
    const oldSelection = sel(1, 10, 'old');

    // when
    updateExistingSelection(
        accumulator,
        oldSelection,
        rootNode
    );
    const updatedSelection = _.head(accumulator.updated);

    // then
    expect(updatedSelection).toEqual(sel(1, 9, 'old'));
  })
});