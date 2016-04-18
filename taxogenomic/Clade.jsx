import React from "react";
import Edge from "./Edge.jsx";
import Node from "./Node.jsx";
import Genome from "./Genome.jsx";
import microsoftBrowser from "./util/microsoftBrowser";
import {genomesWidth, leafNodeHeight} from "../reactVis.jsx";

const textWidth = 190;
const genomePadding = 2;

export default class Clade extends React.Component {
  constructor(props) {
    super(props);
    this.state = {className: 'clade'}
  }

  addHighlightClass() {
    this.setClassNameState('clade highlight');
  }

  removeHighlightClass() {
    this.setClassNameState('clade');
  }

  notifyOfHover(e) {
    e.stopPropagation();
    this.props.onNodeHighlight(this.props.node);
  }

  setClassNameState(className) {
    if(this.state.className !== className) {
      this.setState({className: className});
    }
  }

  render() {
    return (
      <g className={this.state.className}
        {...this.gProps()}

        // use mouse enter/leave to set class for coloring path
         onMouseEnter={this.addHighlightClass.bind(this)}
         onMouseLeave={this.removeHighlightClass.bind(this)}

         // mouse over (with propagation stopped) for notifying others
         // of mouse over.
         onMouseOver={this.notifyOfHover.bind(this)}>
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
        <g className="node-label">
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
          <Clade key={key}
                 node={child}
                 nodeDisplayInfo={this.props.nodeDisplayInfo}
                 onNodeHighlight={this.props.onNodeHighlight} />
        );
      });
    }
  }

  renderGenome() {
    const genome = this.props.node.model.genome;

    if (genome) {
      const globalStats = this.props.node.globalResultSetStats();
      const translateX = textWidth + genomePadding;
      const translateY = (leafNodeHeight / 2) - genomePadding;
      const transform = `translate(${translateX}, -${translateY})`;
      const width = genomesWidth - genomePadding;
      const height = leafNodeHeight - genomePadding;

      return (
        <g className="genome-padding" transform={transform}>
          <Genome genome={genome}
                  globalStats={globalStats}
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
  isRoot: React.PropTypes.bool,
  onNodeHighlight: React.PropTypes.func.isRequired
};