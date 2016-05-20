import _ from "lodash";
import getSelectionsThatMayNeedUpdating from '../../taxogenomic/util/selection/getSelectionsThatMayNeedUpdating';

describe('getSelectionsThatMayNeedUpdating', () => {
  let selections;

  beforeEach(() => {
    selections = [
      { binFrom: {idx: 1}, binTo: {idx: 5}, name: 'foo' },
      { binFrom: {idx: 6}, binTo: {idx: 10}, name: 'bar' },
      { binFrom: {idx: 15}, binTo: {idx: 20}, name: 'zyxxy' }
    ]
  });

  it('should return no selections where there are none', () => {
    // when
    expect(getSelectionsThatMayNeedUpdating(selections, 25, 30).length).toEqual(0);
    expect(getSelectionsThatMayNeedUpdating(selections, 0, 0).length).toEqual(0);
  });

  it('should return 1 selection when start and end are within that selection', () => {
    const found = getSelectionsThatMayNeedUpdating(selections, 3, 4);
    expect(found.length).toEqual(1);
    expect(_.head(found).name).toEqual('foo');
  });

  it('should return 1 selection when start is within and end is after', () => {
    const found = getSelectionsThatMayNeedUpdating(selections, 17, 24);
    expect(found.length).toEqual(1);
    expect(_.head(found).name).toEqual('zyxxy');
  });

  it('should return 1 selection when start is before and end is after', () => {
    const found = getSelectionsThatMayNeedUpdating(selections, 13, 24);
    expect(found.length).toEqual(1);
    expect(_.head(found).name).toEqual('zyxxy');
  });

  it('should return 1 selection when start is before and end is within', () => {
    const found = getSelectionsThatMayNeedUpdating(selections, 13, 17);
    expect(found.length).toEqual(1);
    expect(_.head(found).name).toEqual('zyxxy');
  });

  it('should return 2 selections if start and end touch them inclusively', () => {
    const found = getSelectionsThatMayNeedUpdating(selections, 10, 15);
    expect(found.length).toEqual(2);
    expect(_.head(found).name).toEqual('bar');
    expect(_.last(found).name).toEqual('zyxxy');
  });

});