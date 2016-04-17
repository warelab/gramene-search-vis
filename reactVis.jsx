import React from "react";
import _ from "lodash";

import layoutNodes from './taxogenomic/util/layout';
import visibleLeafCount from './taxogenomic/util/visibleLeafCount';

import Taxonomy from './taxogenomic/Taxonomy.jsx';

import {textWidth} from './taxogenomic/Clade.jsx';

const visWidth = 750;
const leafNodeHeight = 12;

const speciesTreeProportion = 0.18;
const textProportion = textWidth / visWidth;
const genomesProportion = 1 - speciesTreeProportion - textProportion;

const speciesTreeWidth = visWidth * speciesTreeProportion;
const genomesWidth = visWidth * genomesProportion;
const genomesStart = visWidth - genomesWidth;

export default class Vis extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nodeDisplayInfo: this.initNodeState(props.taxonomy),
      rootNodeId: 2759 // eukaryota
    };
  }

  initNodeState(taxonomy = this.props.taxonomy) {
    return _(taxonomy.all())
      .keyBy('model.id')
      .mapValues(()=>({ expanded: true, highlight: false }))
      .value();
  }

  componentWillMount() {
    this.updateTaxonomyDisplayInfo();
  }

  componentWillReceiveProps(newProps) {
    this.updateTaxonomyDisplayInfo(newProps);
  }

  updateTaxonomyDisplayInfo(props = this.props) {
    const newDisplayInfo = layoutNodes(
      speciesTreeWidth,
      this.height(),
      props.taxonomy,
      this.state.nodeDisplayInfo,
      this.state.rootNodeId
    );
    
    this.setState({nodeDisplayInfo: newDisplayInfo})
  }

  rootNode() {
    return this.props.taxonomy.indices.id[this.state.rootNodeId];
  }
  
  height() {
    return visibleLeafCount(this.props.taxonomy, this.state.nodeDisplayInfo) * leafNodeHeight;
  }

  width() {
    return visWidth;
  }

  margin() {
    return 10;
  }

  marginTransform() {
    const m = this.margin() / 2;
    return `translate(${m},${m})`;
  }

  renderSvg() {
    return (
      <svg width={this.width() + this.margin()}
           height={this.height() + this.margin()}>
        <g className="margin" transform={this.marginTransform()}>
          <Taxonomy rootNode={this.rootNode()}
                    nodeDisplayInfo={this.state.nodeDisplayInfo}
                    onNodeHighlight={this.props.onTaxonHighlight} />
        </g>
      </svg>
    )
  }

  render() {
    return (
      <div className="taxogenomic-vis">
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
  
  onTaxonSelection: React.PropTypes.func,
  onTaxonHighlight: React.PropTypes.func
};

export { leafNodeHeight, genomesWidth, genomesStart };