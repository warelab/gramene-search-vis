import _ from "lodash";

export default class PropsComparer {
  constructor(...listOfPaths) {
    const badPaths = _.filter(listOfPaths, (path) =>
      !(_.isString(path) || PropsComparer.isPathObject(path))
    );
    if(badPaths.length) {
      console.log('badpaths', badPaths);
      throw new Error(`${badPaths.length} paths that can't be used`);
    }
    this.listOfPaths = listOfPaths;
  }

  differ(stateA, stateB) {
    return !!_.find(this.listOfPaths, (thePath) => {
      if(_.isString(thePath)) {
        return PropsComparer.stringDiffer(stateA, stateB, thePath);
      }
      else if(PropsComparer.isPathObject(thePath)) {
        return PropsComparer.objectDiffer(stateA, stateB, thePath);
      }
    });
  }

  static isPathObject(path) {
    return _.isObject(path) && !(_.isUndefined(path.path) || _.isUndefined(path.referenceValue));
  }

  static stringDiffer(stateA, stateB, thePath) {
    const a = _.get(stateA, thePath);
    const b = _.get(stateB, thePath);

    return !_.isEqual(a, b);
  }

  static objectDiffer(stateA, stateB, thePath) {
    const {referenceValue, path} = thePath;
    const a = PropsComparer.matchesReferenceValue(stateA, path, referenceValue);
    const b = PropsComparer.matchesReferenceValue(stateB, path, referenceValue);

    return a || b;
  }

  static matchesReferenceValue(state, path, referenceValue) {
    return !_.isEqual(_.get(state, path), referenceValue);
  }
}
