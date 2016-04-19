import React from 'react';
import Clade from './Clade.jsx';

export default class Taxonomy extends React.Component {
  
  render() {
    return (
      <g className="taxonomy">
        <Clade node={this.props.rootNode}
               nodeDisplayInfo={this.props.nodeDisplayInfo}
               isRoot={true}
               onNodeHighlight={this.props.onNodeHighlight}
               svgMetrics={this.props.svgMetrics} />
      </g>
    )
  }
}

Taxonomy.propTypes = {
  rootNode: React.PropTypes.object.isRequired,
  nodeDisplayInfo: React.PropTypes.object.isRequired,
  onNodeHighlight: React.PropTypes.func.isRequired,
  svgMetrics: React.PropTypes.object.isRequired
};