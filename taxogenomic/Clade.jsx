import React from "react";
import numeral from 'numeral';

import Edge from "./Edge.jsx";
import Node from "./Node.jsx";
import Genome from "./Genome.jsx";

import transform from './util/transform';
import {leafNodeHeight} from "./ReactVis.jsx";

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
    this.props.onHighlight({taxon: this.props.node.model});
  }

  handleCladeSelection(e) {
    e.stopPropagation();
    this.props.onSelection({
      name: this.props.node.model.name,
      taxon: this.props.node.model
    });
  }

  setClassNameState(className) {
    if (this.state.className !== className) {
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
         onMouseOver={this.notifyOfHover.bind(this)}
         onSelect={this.handleCladeSelection.bind(this)}>
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
                   displayInfo={this.displayInfo()} />
    }
  }

  renderNode() {
    return <Node node={this.props.node}
                 displayInfo={this.displayInfo()} />
  }

  renderText() {
    if (!this.props.node.hasChildren()) {
      return (
        <g className="node-label">
          {this.renderSpeciesName()}
          <text x={this.props.svgMetrics.width.text} y="4.75" className="results-count" textAnchor="end">
            {numeral(this.props.node.model.results.count).format('0,0')}
          </text>
        </g>
      );
    }
  }

  renderSpeciesName() {
    if(this.props.svgMetrics.layout.showSpeciesNames) {
      return (
        <text x="10" y="4.75" className="species-name">
          {this.speciesName()}
        </text>
      );
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
      const propsPassthrough = _.pick(this.props, [
        'nodeDisplayInfo',
        'svgMetrics',
        'state',
        'onSelection',
        'onSelectionStart',
        'onHighlight'
      ]);
      return this.props.node.children.map((child) => {
        const key = _.get(child, 'model.id');
        if (!_.isNumber(key)) {
          throw new Error("No node id for child!");
        }
        return (
          <Clade key={key}
                 node={child}
                 {...propsPassthrough} />
        );
      });
    }
  }

  renderGenome() {
    const genome = this.props.node.model.genome;
    const metrics = this.props.svgMetrics;
    const genomePadding = metrics.layout.genomePadding;

    if (genome) {
      const globalStats = this.props.node.globalResultSetStats();
      const translateX = metrics.width.text + genomePadding;
      const translateY = (leafNodeHeight / 2) - genomePadding;
      const translate = transform(translateX, -translateY);
      const width = metrics.width.genomes - genomePadding;
      const height = leafNodeHeight - genomePadding;
      const propsPassthrough = _.pick(this.props, ['svgMetrics', 'state', 'onSelection', 'onSelectionStart', 'onHighlight']);

      return (
        <g className="genome-padding" {...translate}>
          <Genome genome={genome}
                  globalStats={globalStats}
                  width={width}
                  height={height}
                  {...propsPassthrough} />
        </g>
      )
    }
  }

  gProps() {
    return transform(this.displayInfo().offsetY, this.displayInfo().offsetX);
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

Clade.propTypes = {
  node: React.PropTypes.object.isRequired,
  nodeDisplayInfo: React.PropTypes.object.isRequired,
  isRoot: React.PropTypes.bool,
  svgMetrics: React.PropTypes.object.isRequired,
  
  state: React.PropTypes.object.isRequired,
  onSelection: React.PropTypes.func.isRequired,
  onSelectionStart: React.PropTypes.func.isRequired,
  onHighlight: React.PropTypes.func.isRequired
};