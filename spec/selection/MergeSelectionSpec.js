import mergeOldSelectionIntoNew from '../../taxogenomic/util/selection/mergeOldSelectionIntoNew';
import { bin, sel } from '../support/simpleMocks';

describe('mergeOldSelectionIntoNew', () => {

  it('should not merge selections that do not overlap', () => {
    // given
    const oldSel = sel(1, 10, 'old');
    const newSel = sel(21, 30, 'new');

    // when
    const mergeSelFn = () => mergeOldSelectionIntoNew(newSel, oldSel);

    // then
    expect(mergeSelFn).toThrow(
        new Error("Selections don't overlap/are not adjacent")
    );

  });

  it('should not merge selections that do not overlap', () => {
    // given
    const oldSel = sel(1, 10, 'old');
    const newSel = sel(21, 30, 'new');

    // when
    const mergeSelFn = () => mergeOldSelectionIntoNew(newSel, oldSel);

    // then
    expect(mergeSelFn).toThrow(
        new Error("Selections don't overlap/are not adjacent")
    );
  });

  it('should not merge selections that do not overlap', () => {
    // given
    const oldSel = sel(21, 30, 'old');
    const newSel = sel(1, 10, 'new');

    // when
    const mergeSelFn = () => mergeOldSelectionIntoNew(newSel, oldSel);

    // then
    expect(mergeSelFn).toThrow(
        new Error("Selections don't overlap/are not adjacent")
    );
  });

  it('should not change new selection if it entirely covers the old one', () => {
    // given
    const oldSel = sel(21, 30, 'old');
    const newSel = sel(1, 100, 'new');

    // when
    const mergeSel = mergeOldSelectionIntoNew(newSel, oldSel);

    // then
    expect(mergeSel).toEqual(newSel);
  });

  it('should extend new selection if it entirely covered by the old one', () => {
    // given
    const oldSel = sel(1, 100, 'old');
    const newSel = sel(21, 42, 'new');

    // when
    const mergeSel = mergeOldSelectionIntoNew(newSel, oldSel);

    // then
    expect(mergeSel).toEqual(sel(1, 100, 'new'));
  });

  it('should not extend new selection if it the new one is a deselect', () => {
    // given
    const oldSel = sel(1, 100, 'old');
    const newSel = sel(21, 42, 'new', false);

    // when
    const mergeSel = () => mergeOldSelectionIntoNew(newSel, oldSel);

    // then
    expect(mergeSel).toThrow(
        new Error("Can only merge selections if they are both the same type")
    );
  });

  it('should extend new selection if it is partially covered by the old one', () => {
    // given
    const oldSel = sel(1, 30, 'old');
    const newSel = sel(21, 42, 'new');

    // when
    const mergeSel = mergeOldSelectionIntoNew(newSel, oldSel);

    // then
    expect(mergeSel).toEqual(sel(1, 42, 'new'));
  });

  it('should extend new selection into adjacent old one', () => {
    // given
    const oldSel = sel(1, 30, 'old');
    const newSel = sel(31, 42, 'new');

    // when
    const mergeSel = mergeOldSelectionIntoNew(newSel, oldSel);

    // then
    expect(mergeSel).toEqual(sel(1, 42, 'new'));
  });
});