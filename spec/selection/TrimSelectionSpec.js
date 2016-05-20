import { trimEndOfExistingSelection, trimStartOfExistingSelection } from '../../taxogenomic/util/selection/trimExistingSelection';
import { sel, rootNode } from '../support/simpleMocks';

describe('trimSelections', () => {

  it('should not trim end of selections that do not overlap', () => {
    // given
    const oldSel = sel(1, 10, 'old');
    const newSel = sel(21, 30, 'new', false);

    // when
    const trimSelFn = () => trimEndOfExistingSelection(newSel, oldSel, rootNode);

    // then
    expect(trimSelFn).toThrow(
        new Error("No appropriate overlap for trim")
    );
  });

  it('should not trim end of selections that should be merged', () => {
    // given
    const oldSel = sel(1, 10, 'old');
    const newSel = sel(21, 30, 'new');

    // when
    const trimSelFn = () => trimEndOfExistingSelection(newSel, oldSel, rootNode);

    // then
    expect(trimSelFn).toThrow(
        new Error("These selections should be merged!")
    );
  });

  it('should not trim start of selections that do not overlap', () => {
    // given
    const oldSel = sel(21, 30, 'old');
    const newSel = sel(1, 10, 'new', false);

    // when
    const trimSelFn = () => trimStartOfExistingSelection(newSel, oldSel, rootNode);

    // then
    expect(trimSelFn).toThrow(
        new Error("No appropriate overlap for trim")
    );
  });

  it('should not trim selections if completely enveloped', () => {
    // given
    const oldSel = sel(21, 30, 'old');
    const newSel = sel(1, 100, 'new', false);

    // when
    const trimSelFn = () => trimStartOfExistingSelection(newSel, oldSel, rootNode);

    // then
    expect(trimSelFn).toThrow(
        new Error("Old bin should be removed, not trimmed")
    );
  });

  it('should not trim selections with leading overhang using trimEnd', () => {
    // given
    const oldSel = sel(21, 30, 'old');
    const newSel = sel(1, 25, 'new', false);

    // when
    const trimSelFn = () => trimEndOfExistingSelection(newSel, oldSel, rootNode);

    // then
    expect(trimSelFn).toThrow(new Error('Cannot end selection before it starts'));
  });

  it('should not trim selections with trailing overhang using trimStart', () => {
    // given
    const oldSel = sel(21, 30, 'old');
    const newSel = sel(25, 100, 'new', false);

    // when
    const trimSelFn = () => trimStartOfExistingSelection(newSel, oldSel, rootNode);

    // then
    expect(trimSelFn).toThrow(new Error('Cannot start selection after it ends'));
  });

  it('should trim selections with leading overhang', () => {
    // given
    const oldSel = sel(21, 30, 'old');
    const newSel = sel(1, 25, 'new', false);

    // when
    const trimSel = trimStartOfExistingSelection(newSel, oldSel, rootNode);

    // then
    expect(trimSel).toEqual(sel(26, 30, 'old'));
  });

  it('should trim selections with trailing overhang', () => {
    // given
    const oldSel = sel(21, 30, 'old');
    const newSel = sel(25, 100, 'new', false);

    // when
    const trimSel = trimEndOfExistingSelection(newSel, oldSel, rootNode);

    // then
    expect(trimSel).toEqual(sel(21, 24, 'old'));
  });


});
