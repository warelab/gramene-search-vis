import React from "react";
import _ from "lodash";

const WIDTH = 400;
const LEAF_NODE_HEIGHT = 12;

export default class Vis extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nodes: this.updateNodeState(props.taxonomy)
    };
  }

  updateNodeState(taxonomy = this.props.taxonomy) {
    return _.mapValues(taxonomy.indices.id, ()=> {
      return {
        expanded: true
      }
    });
  }
  
  visibleLeafNodes() {
    var count = 0;

    this.props.taxonomy.filterWalk(function (n) {
      // if a node has no children, it's a leaf node (with a reference genome)
      if(!n.hasChildren()) {
        if(!n.model.genome) {
          throw new Error(`Node ${_.get(n, 'model.id')} has no genome`);
        }
        ++count;
      }

      // only look at the children if they are visible in the chart.
      return this.state.nodes[n.model.id].expanded;
    }.bind(this));

    return count;
  }
  
  svgHeight() {
    return this.visibleLeafNodes() * LEAF_NODE_HEIGHT;
  }

  renderSvg() {
    return (
      <svg width={WIDTH} height={this.svgHeight()}>
        <text x="20" y="20">{_.get(this.props, 'taxonomy.model.results.count')}</text>
      </svg>
    )
  }

  render() {
    return (
      <div>
        {this.renderSvg()}
      </div>
    )
  }
}

Vis.propTypes = {
  taxonomy: React.PropTypes.object.isRequired,
  onSubtreeCollapse: React.PropTypes.func,
  onSubtreeExpand: React.PropTypes.func,
  onTreeRootChange: React.PropTypes.func,
  onGeneSelection: React.PropTypes.func
};