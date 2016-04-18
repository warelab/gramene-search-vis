import React from "react";
import Genome from "./Genome.jsx";

const genomePadding = 2;

export default class Genomes extends React.Component {

  constructor(props) {
    super(props);
    this.updateResultsCount(props);
  }

  getSetResultsCallCount(props) {
    return props.rootNode.globalResultSetStats().timesSetResultsHasBeenCalled;
  }

  didResultsChange(props) {
    const newResultsState = this.getSetResultsCallCount(props);
    console.log("change?", newResultsState, this.genomeResultsState);
    return this.genomeResultsState !== newResultsState;
  }

  updateResultsCount(props) {
    this.genomeResultsState = this.getSetResultsCallCount(props);;
  }

  shouldComponentUpdate(newProps) {
    // only re-render this component if the results changed.
    const decision = this.didResultsChange(newProps);
    this.updateResultsCount(newProps);
    return decision;
  }

  getGenomicNodeses() {
    return this.props.rootNode.all((node) => !!node.model.genome)
  }

  render() {
    return (
      <g className="genomes">
        {this.renderGenomes()}
      </g>
    )
  }

  renderGenomes() {
    return this.getGenomicNodeses().map(this.padGenome.bind(this))
  }

  padGenome(node, idx) {
    if (node.model.genome) {
      const yOffset = idx * this.props.genomeHeight;
      const translateX = this.props.xOffset + genomePadding;
      const translateY = yOffset + genomePadding;
      const transform = `translate(${translateX}, ${translateY})`;

      return (
        <g key={idx} className="genome-padding" transform={transform}>
          {this.renderGenome(node)}
        </g>
      )
    }
  }


  renderGenome(node) {
    const genome = node.model.genome;
    const globalStats = node.globalResultSetStats();
    const width = this.props.genomeWidth - genomePadding;
    const height = this.props.genomeHeight - genomePadding;

    return (
      <Genome genome={genome}
              globalStats={globalStats}
              width={width}
              height={height}/>
    )
  }
}

Genomes.propTypes = {
  genomeHeight: React.PropTypes.number.isRequired,
  genomeWidth: React.PropTypes.number.isRequired,
  xOffset: React.PropTypes.number.isRequired,
  rootNode: React.PropTypes.object.isRequired,
  nodeDisplayInfo: React.PropTypes.object.isRequired
};