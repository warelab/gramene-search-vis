import React from 'react';
import _ from 'lodash';
import Vis from './taxogenomic/ReactVis.jsx';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.numQueries = this.props.exampleQueries.length;
    this.state = {qs: this.updateQueryState()};
  }

  updateQueryState() {
    var currentIdx, newIdx, results, qName, taxonomy;

    currentIdx = _.get(this.state, 'qs.queryIndex', -1);
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
    this.setState({qs: this.updateQueryState()});
  }

  logFactory(name) {
    return () => console.log(`Event ${name}`, arguments);
  }

  render() {
    return (
      <div className="app">
        <p>{this.state.qs.queryIndex} {this.state.qs.queryName}</p>
        <button type="button" onClick={this.changeQuery.bind(this)}>Change Query</button>
        <Vis taxonomy={this.state.qs.taxonomy}
             parentWidth={this.state.elementWidthPx}
             onSelection={(s)=>this.setState({selection:s})}
             onHighlight={(h)=>this.setState({highlight:h})}
        />
        {this.renderSelectedTaxa()}
      </div>
    );
  }

  renderSelectedTaxa() {
    if(this.state.highlight) {
      const Selection = ({selection})=><li>{selection.name}</li>;
      const state = [];
      if(this.state.highlight) {
        console.log("HIGHLIGHT", this.state.highlight);
        state.push(<Selection key="highlight"
                         selection={this.state.highlight} />)
      }

      return (
        <ul>
          {state}
        </ul>
      )
    }
  }
}

App.propTypes = {
  taxonomy: React.PropTypes.object.isRequired,
  exampleQueries: React.PropTypes.array.isRequired,
  exampleResults: React.PropTypes.array.isRequired
};