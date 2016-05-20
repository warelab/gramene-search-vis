import checkForObviousErrors from '../../taxogenomic/util/selection/checkForObviousErrors';

describe('obvious errors', () => {
  it('should error out with no selection state specified', () => {
    const expectedError = new Error("Must provide selection object");
    expect(()=>checkForObviousErrors()).toThrow(expectedError);
    expect(()=>checkForObviousErrors(null)).toThrow(expectedError);
    expect(()=>checkForObviousErrors('string')).toThrow(expectedError);
    expect(()=>checkForObviousErrors({})).not.toThrow(expectedError);
  });

  it('should error out if no `select` property in selection object', () => {
    const expectedError = new Error("Must specify selection state");
    expect(()=>checkForObviousErrors({})).toThrow(expectedError);
    expect(()=>checkForObviousErrors({select: undefined})).toThrow(expectedError);
    expect(()=>checkForObviousErrors({select: false})).not.toThrow(expectedError);
  });

  it('should error out if there are no start or end properties', () => {
    const selection = {select: false};
    const expectedError = new Error("Selection must specify binFrom and binTo");
    expect(()=>checkForObviousErrors(selection)).toThrow(expectedError);
    expect(()=>checkForObviousErrors(selection, 1)).toThrow(expectedError);
    expect(()=>checkForObviousErrors(selection, 1, '2')).toThrow(expectedError);
    expect(()=>checkForObviousErrors(selection, 1, 2)).not.toThrow(expectedError);
    expect(()=>checkForObviousErrors(selection, 1, -2)).not.toThrow(expectedError);
  });
  
  it('should error out if start and end are inverted', () => {
    const selection = {select: false};
    const expectedError = new Error("Malformed selection: binTo is before binFrom");
    expect(()=>checkForObviousErrors(selection, 2, 1)).toThrow(expectedError);
    expect(()=>checkForObviousErrors(selection, 1, 2)).not.toThrow(expectedError);
  });
});
