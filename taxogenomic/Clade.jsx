import React from 'react';

import Edge from './Edge.jsx';
import Node from './Node.jsx';

import microsoftBrowser from './util/microsoftBrowser';

export default class Clade extends React.Component {
  render() {
    return (
      <g className="clade" {...this.gProps()}>
        {this.renderEdge()}
        {this.renderNode()}
        {this.renderText()}
        {this.renderSubclades()}
      </g>
    )
  }

  renderEdge() {
    if(!this.props.node.isRoot()) {
      return <Edge node={this.props.node}
                   displayInfo={this.displayInfo()}
                   onSelect={()=>{}} />
    }
  }

  renderNode() {
    return <Node node={this.props.node}
                 displayInfo={this.displayInfo()}
                 onSelect={()=>{}} />

  }

  renderText() {
    // return <text>{this.props.node.model.results.count}</text>
  }

  renderSubclades() {
    if(this.showChildren()) {
      return this.props.node.children.map( (child) => {
        const key = _.get(child, 'model.id');
        if(!_.isNumber(key)) {
          throw new Error("No node id for child!");
        }
        return (
          <Clade key={key} node={child} nodeDisplayInfo={this.props.nodeDisplayInfo}/>
        );
      });
    }
  }

  gProps() {
    const props = {};

    const transform = (isStyle = !microsoftBrowser) => {
      const px = isStyle ? 'px' : '';
      const x = this.displayInfo().offsetX;
      const y = this.displayInfo().offsetY;

      return `translate(${y}${px}, ${x}${px})`;
    };

    if(microsoftBrowser) {
      props.transform = transform(false);
    }
    else {
      props.style = { transform: transform(true) };
    }

    return props;
  }

  componentWillMount() {
    const node = this.props.node;
    this.nodeId = _.get(node, 'model.id');
    if(!_.isNumber(this.nodeId)) {
      throw new Error(`No node id found!`);
    }
  }

  displayInfo() {
    return this.props.nodeDisplayInfo[this.nodeId];
  }

  showChildren() {
    const children = this.props.node.children;
    const nodeExpanded = this.displayInfo().expanded;
    return children && children.length && nodeExpanded;
  }
}

Clade.propTypes = {
  node: React.PropTypes.object.isRequired,
  nodeDisplayInfo: React.PropTypes.object.isRequired
};