import _ from 'lodash';
import d3 from 'd3';

const UNSIZED_LAYOUT = d3.layout.cluster().separation(function(a,b){return 1});

export default function layoutNodes(width, height, taxonomy, currentDisplayInfo, rootNodeId) {
  const rootNode = taxonomy.indices.id[rootNodeId];
  return updateNodeCoordinates();

  // update x and y coordinates for currently visible nodes
  function updateNodeCoordinates() {

    // clear out any existing position information in readiness of calculating
    // it again.
    const incompleteNodeDisplayInfo = _.mapValues(currentDisplayInfo,
      (v)=>_.omit(v, ['x', 'y', 'offsetX', 'offsetY', 'lineThickness'])
    );

    const layout = UNSIZED_LAYOUT.size([height, width]);
    const nodes = layout.nodes(d3data(incompleteNodeDisplayInfo));
    const strokeScale = getStrokeScale();

    for(let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const displayInfo = incompleteNodeDisplayInfo[node.id];
      displayInfo.x = node.x;
      displayInfo.y = node.y;
      displayInfo.lineThickness = strokeScale(node.proportion);
    }

    return updateRelativeNodeCoordinates(incompleteNodeDisplayInfo);
  }

  function getStrokeScale() {
    const maxScore = taxonomy.globalResultSetStats().maxProportion;
    const maxRange = maxScore >= 1 ? 2 : 5;
    return d3.scale.linear()
      .domain([0, maxScore])
      .range([.5, maxRange]);
  }

  // get data structure of currently visible nodes
  function d3data(nodeDisplayInfo) {
    let count = 0;
    const d3dataRecursive = (node) => {
      const id = node.model.id;
      const proportion = node.model.results.proportion;
      const isExpanded = nodeDisplayInfo[id].expanded;
      const datum = {id: id, proportion: proportion};
      if(isExpanded && node.hasChildren()) {
        datum.children = node.children.map(d3dataRecursive);
      }
      return datum;
    };

    return d3dataRecursive(rootNode);
  }

  function updateRelativeNodeCoordinates(incompleteNodeDisplayInfo) {
    const updateRecursive = (node, parentX = 0, parentY = 0, result = {}, depth = 0) => {
      const nodeId = _.get(node, 'model.id');
      if(!nodeId) {
        throw new Error(`No nodeId for ${node}`);
      }
      const displayInfo = result[nodeId] = _.cloneDeep(incompleteNodeDisplayInfo[nodeId]);
      if(!displayInfo) {
        throw new Error(`No displayInfo for ${node.model.id}`);
      }
      displayInfo.offsetX = displayInfo.x - parentX;
      displayInfo.offsetY = displayInfo.y - parentY;

      if(displayInfo.expanded && node.hasChildren()) {
        node.children.map((child)=>updateRecursive(
          child,
          displayInfo.x,
          displayInfo.y,
          result,
          depth + 1))
      }

      return result;
    };

    return updateRecursive(taxonomy);
  }
};


