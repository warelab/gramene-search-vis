var React = require('react');
var d3 = require('d3');
var taxonomyGetter = require('gramene-taxonomy-with-genomes');
var search = require('gramene-search-client').client;
var Q = require('q');

var $ = require('jquery');

var WareTreeGeneDistribution = require('./kb/WareTreeGeneDistribution.js');

var Vis = require('./vis.jsx');

// Example query object.
// This is usually generated in code by gramoogle.
// This query:
//   1. asks for all genes with a particular InterPro domain
//   2. requests binned results that will match the bin configuration
//      of the taxonomy object
//   3. requests also to get taxonomy facet.
var exampleQuery = {
  "q": "",
  "filters": {
    "interpro_ancestors:2347": {
      "fq": "interpro_ancestors:2347"
    }
  },
  "resultTypes": {
    "taxon_id": {"facet.field": "{!facet.limit='50' facet.mincount='0' key='taxon_id'}taxon_id"},
    "fixed_200_bin": {"facet.field": "{!facet.limit='-1' facet.mincount='1' key='fixed_200_bin'}fixed_200_bin"}
  }
};

var contentEl = document.getElementById('the-test-vis');
//React.render((<p>Loading…</p>), contentEl);

Q.all([
  taxonomyGetter.get(),
  search.geneSearch(exampleQuery)
]).spread(function (taxonomy, results) {
  taxonomy.setBinType('fixed', 200);
  taxonomy.setResults(results.fixed_200_bin);

  //var visComponent = new Vis({taxonomy: taxonomy, results: results, derp: derp});
  var AppComponent = React.createClass({
    getInitialState: function() {
      return {derp: 0}
    },
    upderp: function() {
      this.setState({derp: this.state.derp + 1});
    },
    render: function() {
      return (
        <div>
          <button type="button" onClick={this.upderp}>Change Props (DERP: {this.state.derp})</button>
          <Vis taxonomy={taxonomy} derp={this.state.derp} />
          <Vis taxonomy={taxonomy} derp={this.state.derp} />
        </div>
      );
    }
  });


// TODO: in the real world we will pass in the search object so we can infer correct tree state from taxonomy filters.
  React.render(<AppComponent />, contentEl);
}).catch(function (err) {
  console.error(err);
});

