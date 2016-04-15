import React from "react";
import Edge from "./Edge.jsx";
import Node from "./Node.jsx";
import Genome from "./Genome.jsx";
import microsoftBrowser from "./util/microsoftBrowser";

const textWidth = 200;
const genomePadding = 2;
import { genomesWidth, leafNodeHeight } from '../reactVis.jsx';

export default class Clade extends React.Component {
  render() {
    return (
      <g className="clade" {...this.gProps()}>
        {this.renderEdge()}
        {this.renderNode()}
        {this.renderText()}
        {this.renderSubclades()}
        {this.renderGenome()}
      </g>
    )
  }

  renderEdge() {
    if (!this.props.isRoot) {
      return <Edge node={this.props.node}
                   displayInfo={this.displayInfo()}
                   onSelect={()=>{}}/>
    }
  }

  renderNode() {
    return <Node node={this.props.node}
                 displayInfo={this.displayInfo()}
                 onSelect={()=>{}}/>

  }

  renderText() {
    if (!this.props.node.hasChildren()) {
      return (
        <g>
          <text className="species-name">
            <textPath xlinkHref="#species-name-path">
              {this.speciesName()}
            </textPath>
          </text>
          <text x={textWidth} y="5" className="results-count" textAnchor="end">
            {this.props.node.model.results.count.toLocaleString()}
          </text>
        </g>
      )
    }
  }

  speciesName() {
    const fullName = this.props.node.model.name;
    const removedExtraineousWords = fullName.replace(/( Group$| subsp\.| var\.| strain)/, '');
    let finalVersion;
    if (removedExtraineousWords.length > 20) {
      // abrreviate first word.
      finalVersion = removedExtraineousWords.replace(/^([A-Z])[a-z]+/, '$1.')
    }
    else {
      finalVersion = removedExtraineousWords;
    }
    return finalVersion;
  }

  renderSubclades() {
    if (this.showChildren()) {
      return this.props.node.children.map((child) => {
        const key = _.get(child, 'model.id');
        if (!_.isNumber(key)) {
          throw new Error("No node id for child!");
        }
        return (
          <Clade key={key} node={child} nodeDisplayInfo={this.props.nodeDisplayInfo}/>
        );
      });
    }
  }

  renderGenome() {
    const genome = this.props.node.model.genome;

    if (genome) {
      const translateX = textWidth + genomePadding;
      const translateY = (leafNodeHeight / 2) - genomePadding;
      const transform = `translate(${translateX}, -${translateY})`;
      const width = genomesWidth - genomePadding;
      const height = leafNodeHeight - genomePadding;

      return (
        <g className="genome-padding" transform={transform}>
          <Genome genome={genome}
                  width={width}
                  height={height}/>
        </g>
      )
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

    if (microsoftBrowser) {
      props.transform = transform(false);
    }
    else {
      props.style = {transform: transform(true)};
    }

    return props;
  }

  componentWillMount() {
    const node = this.props.node;
    this.nodeId = _.get(node, 'model.id');
    if (!_.isNumber(this.nodeId)) {
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

export {textWidth};

Clade.propTypes = {
  node: React.PropTypes.object.isRequired,
  nodeDisplayInfo: React.PropTypes.object.isRequired,
  isRoot: React.PropTypes.bool
};