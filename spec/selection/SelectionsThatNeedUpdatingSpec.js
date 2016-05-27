import _ from "lodash";
import getSelectionsThatMayNeedUpdating from '../../taxogenomic/util/selection/getSelectionsThatMayNeedUpdating';
import { sel } from '../support/simpleMocks';

describe('getSelectionsThatMayNeedUpdating', () => {
  let selections;

  beforeEach(() => {
    selections = [
      sel(1, 5, 'foo'),
      sel(6, 10, 'bar'),
      sel(15, 20, 'zyxxy')
    ]
  });

  it('should return no selections where there are none', () => {
    // when
    const partitioned = getSelectionsThatMayNeedUpdating(selections, sel(25, 30));

    // then
    expect(partitioned.toUpdate.length).toEqual(0);
  });

  it('should return 1 selection when start and end are within that selection', () => {
    const found = getSelectionsThatMayNeedUpdating(selections, sel(3, 4)).toUpdate;
    expect(found.length).toEqual(1);
    expect(_.head(found).name).toEqual('foo');
  });

  it('should return 1 selection when start is within and end is after', () => {
    const found = getSelectionsThatMayNeedUpdating(selections, sel(17, 24)).toUpdate;
    expect(found.length).toEqual(1);
    expect(_.head(found).name).toEqual('zyxxy');
  });

  it('should return 1 selection when start is before and end is after', () => {
    const found = getSelectionsThatMayNeedUpdating(selections, sel(13, 24)).toUpdate;
    expect(found.length).toEqual(1);
    expect(_.head(found).name).toEqual('zyxxy');
  });

  it('should return 1 selection when start is before and end is within', () => {
    const found = getSelectionsThatMayNeedUpdating(selections, sel(13, 17)).toUpdate;
    expect(found.length).toEqual(1);
    expect(_.head(found).name).toEqual('zyxxy');
  });

  it('should return 2 selections if start and end touch them inclusively', () => {
    const found = getSelectionsThatMayNeedUpdating(selections, sel(10, 15)).toUpdate;
    expect(found.length).toEqual(2);
    expect(_.head(found).name).toEqual('bar');
    expect(_.last(found).name).toEqual('zyxxy');
  });

  it('should return selections if start and end are adjacent', () => {
    const found = getSelectionsThatMayNeedUpdating(selections, sel(11, 14)).toUpdate;
    expect(found.length).toEqual(2);
    expect(_.head(found).name).toEqual('bar');
    expect(_.last(found).name).toEqual('zyxxy');
  });

  it('should not return an adjacent selection on a different genome', () => {
    expect(getSelectionsThatMayNeedUpdating(selections, sel(25, 30, 'different genome', true, 2)).toUpdate.length).toEqual(0);
  });

});