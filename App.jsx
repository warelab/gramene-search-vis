import React from 'react';
import _ from 'lodash';
import Vis from './reactVis.jsx';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.numQueries = this.props.exampleQueries.length;
    this.state = this.updateQueryState();
  }

  updateQueryState() {
    var currentIdx, newIdx, results, qName, taxonomy;

    currentIdx = _.get(this.state, 'queryIndex', -1);
    newIdx = ((currentIdx + 1) % this.numQueries);
    results = this.props.exampleResults[newIdx];
    qName = this.props.exampleQueries[newIdx].name;
    taxonomy = this.updateTaxonomy(results);

    return {
      queryIndex: newIdx,
      results: results,
      queryName: qName,
      taxonomy: taxonomy
    };
  }

  updateTaxonomy(results) {
    this.props.taxonomy.setResults(results.fixed_200__bin);
    return this.props.taxonomy; // simulate immutability
  }

  changeQuery() {
    this.setState(this.updateQueryState());
  }

  logFactory(name) {
    return () => console.log(`Event ${name}`, arguments);
  }

  render() {
    return (
      <div>
        <p>{this.state.queryIndex} {this.state.queryName}</p>
        <button type="button" onClick={this.changeQuery.bind(this)}>Change Query</button>
        <Vis taxonomy={this.state.taxonomy}
             onGeneSelection={this.logFactory('GeneSelection')}
             onSubtreeCollapse={this.logFactory('SubtreeCollapse')}
             onSubtreeExpand={this.logFactory('SubtreeExpand')}
             onTreeRootChange={this.logFactory('TreeRootChange')}
        />
      </div>
    );
  }
}

App.propTypes = {
  taxonomy: React.PropTypes.object.isRequired,
  exampleQueries: React.PropTypes.array.isRequired,
  exampleResults: React.PropTypes.array.isRequired
};