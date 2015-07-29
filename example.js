var React = require('react');
var d3 = require('d3');
var taxonomyGetter = require('gramene-taxonomy-with-genomes');
var search = require('gramene-search-client').client;
var Q = require('q');

var $ = require('jquery');

var WareTreeGeneDistribution = require('./kb/WareTreeGeneDistribution.js');

var Vis = require('./vis.js');

// Example query objects.
// This is usually generated in code by gramoogle.
// These queries:
//   1. asks for all genes with a particular filter (or no filter)
//   2. requests binned results that will match the bin configuration
//      of the taxonomy object
//   3. requests also to get taxonomy facet.
var exampleQueries = [
  {
    name: 'No filters',
    "q": "",
    "filters": {},
    "resultTypes": {
      "taxon_id": {"facet.field": "{!facet.limit='50' facet.mincount='0' key='taxon_id'}taxon_id"},
      "fixed_200_bin": {"facet.field": "{!facet.limit='-1' facet.mincount='1' key='fixed_200_bin'}fixed_200_bin"}
    }
  },

  {
    name: 'Domain filter',
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
  },

  {
    name: 'PAD4',
    "q": "",
    "filters": {
      "ids:PAD4": {
        "fq": "ids:PAD4"
      }
    },
    "resultTypes": {
      "taxon_id": {"facet.field": "{!facet.limit='50' facet.mincount='0' key='taxon_id'}taxon_id"},
      "fixed_200_bin": {"facet.field": "{!facet.limit='-1' facet.mincount='1' key='fixed_200_bin'}fixed_200_bin"}
    }
  },

  {
    name: 'Species filter',
    "q": "",
    "filters": {
      "NCBITaxon_ancestors:3702": {
        "fq": "NCBITaxon_ancestors:3702"
      }
    },
    "resultTypes": {
      "taxon_id": {"facet.field": "{!facet.limit='50' facet.mincount='0' key='taxon_id'}taxon_id"},
      "fixed_200_bin": {"facet.field": "{!facet.limit='-1' facet.mincount='1' key='fixed_200_bin'}fixed_200_bin"}
    }
  },

  {
    name: 'Oryzeae filter',
    "q": "",
    "filters": {
      "NCBITaxon_ancestors:147380": {
        "fq": "NCBITaxon_ancestors:147380"
      }
    },
    "resultTypes": {
      "taxon_id": {"facet.field": "{!facet.limit='50' facet.mincount='0' key='taxon_id'}taxon_id"},
      "fixed_200_bin": {"facet.field": "{!facet.limit='-1' facet.mincount='1' key='fixed_200_bin'}fixed_200_bin"}
    }
  },

  {
    name: 'No results',
    "q": "",
    "filters": {
      "NCBITaxon_ancestors:147380": {
        "fq": "NCBITaxon_ancestors:147380"
      },
      "ids:PAD4": {
        "fq": "ids:PAD4"
      }
    },
    "resultTypes": {
      "taxon_id": {"facet.field": "{!facet.limit='50' facet.mincount='0' key='taxon_id'}taxon_id"},
      "fixed_200_bin": {"facet.field": "{!facet.limit='-1' facet.mincount='1' key='fixed_200_bin'}fixed_200_bin"}
    }
  },
];

var promises = exampleQueries.map(function (eg) {
  return search.geneSearch(eg);
});
promises.unshift(taxonomyGetter.get());

Q.all(promises).spread(function (taxonomy) {
  var exampleResults = Array.prototype.slice.call(arguments, 1);
  taxonomy.setBinType('fixed', 200);

  //var visComponent = new Vis({taxonomy: taxonomy, results: results, derp: derp});
  var AppComponent = React.createClass({
    getInitialState: function () {
      return {queryIndex: 0}
    },

    changeQuery: function () {
      this.setState({queryIndex: (++this.state.queryIndex % exampleResults.length)});
    },

    render: function () {
      var queryName = exampleQueries[this.state.queryIndex].name;
      var results = exampleResults[this.state.queryIndex];
      taxonomy.setResults(results.fixed_200_bin);
      return (
        <div>
          <p>{queryName}</p>
          <button type="button" onClick={this.changeQuery}>Change Query</button>
          <Vis taxonomy={taxonomy}/>
        </div>
      );
    }
  });

  // TODO: in the real world we will pass in the search object so we can infer correct tree state from taxonomy filters.
  React.render(<AppComponent />, document.getElementById('the-test-vis'));
}).catch(function (err) {
  console.error(err);
});

