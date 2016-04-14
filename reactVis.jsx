import React from "react";
import _ from "lodash";

import layoutNodes from './taxogenomic/util/layout';
import visibleLeafCount from './taxogenomic/util/visibleLeafCount';

import Taxonomy from './taxogenomic/Taxonomy.jsx';

const WIDTH = 400;
const LEAF_NODE_HEIGHT = 12;

export default class Vis extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nodeDisplayInfo: this.initNodeState(props.taxonomy)
    };
  }

  initNodeState(taxonomy = this.props.taxonomy) {
    return _(taxonomy.all())
      .keyBy('model.id')
      .mapValues(()=>({ expanded: true }))
      .value();
  }

  componentWillMount() {
    this.updateDisplayInfo();
  }

  componentWillReceiveProps(newProps) {
    this.updateDisplayInfo(newProps);
  }

  updateDisplayInfo(props = this.props) {
    const newDisplayInfo = layoutNodes(
      this.width() / 2,
      this.height(),
      props.taxonomy,
      this.state.nodeDisplayInfo
    );
    
    this.setState({nodeDisplayInfo: newDisplayInfo})
  }
  
  height() {
    return visibleLeafCount(this.props.taxonomy, this.state.nodeDisplayInfo) * LEAF_NODE_HEIGHT;
  }

  width() {
    return WIDTH;
  }

  renderSvg() {
    return (
      <svg width={this.width()} height={this.height()}>
        <Taxonomy rootNode={this.props.taxonomy}
                  nodeDisplayInfo={this.state.nodeDisplayInfo} />
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