import React from 'react';
import _ from 'lodash';
import Clade from './Clade.jsx';

export default class Taxonomy extends React.Component {
  
  render() {
    return (
      <g className="taxonomy">
        <Clade node={this.props.rootNode}
               nodeDisplayInfo={this.props.nodeDisplayInfo} />
      </g>
    )
  }
}

Taxonomy.propTypes = {
  rootNode: React.PropTypes.object.isRequired,
  nodeDisplayInfo: React.PropTypes.object.isRequired
};