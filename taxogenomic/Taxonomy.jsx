import React from 'react';
import _ from 'lodash';
import Clade from './Clade.jsx';

export default class Taxonomy extends React.Component {
  
  render() {
    return (
      <g className="taxonomy">
        <defs>
          <path id="species-name-path" d="M 10 5 H 150" stroke="black" />
        </defs>
        <Clade node={this.props.rootNode}
               nodeDisplayInfo={this.props.nodeDisplayInfo}
               isRoot={true} />
      </g>
    )
  }
}

Taxonomy.propTypes = {
  rootNode: React.PropTypes.object.isRequired,
  nodeDisplayInfo: React.PropTypes.object.isRequired
};