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
      "fixed_200__bin": {"facet.field": "{!facet.limit='-1' facet.mincount='1' key='fixed_200__bin'}fixed_200__bin"}
    }
  },

  {
    name: 'Domain filter',
    "q": "",
    "filters": {
      "interpro___ancestors:2347": {
        "fq": "interpro___ancestors:2347"
      }
    },
    "resultTypes": {
      "taxon_id": {"facet.field": "{!facet.limit='50' facet.mincount='0' key='taxon_id'}taxon_id"},
      "fixed_200__bin": {"facet.field": "{!facet.limit='-1' facet.mincount='1' key='fixed_200__bin'}fixed_200__bin"}
    }
  },
  
  {
    name: 'PAD4',
    "q": "",
    "filters": {
      "_terms:(PAD4)": {
        "fq": "_terms:(PAD4)"
      }
    },
    "resultTypes": {
      "taxon_id": {"facet.field": "{!facet.limit='50' facet.mincount='0' key='taxon_id'}taxon_id"},
      "fixed_200__bin": {"facet.field": "{!facet.limit='-1' facet.mincount='1' key='fixed_200__bin'}fixed_200__bin"}
    }
  },
  
  {
    name: 'Species filter',
    "q": "",
    "filters": {
      "NCBITaxon__ancestors:3702": {
        "fq": "NCBITaxon__ancestors:3702"
      }
    },
    "resultTypes": {
      "taxon_id": {"facet.field": "{!facet.limit='50' facet.mincount='0' key='taxon_id'}taxon_id"},
      "fixed_200__bin": {"facet.field": "{!facet.limit='-1' facet.mincount='1' key='fixed_200__bin'}fixed_200__bin"}
    }
  },
  
  {
    name: 'Oryzeae filter',
    "q": "",
    "filters": {
      "NCBITaxon__ancestors:147380": {
        "fq": "NCBITaxon__ancestors:147380"
      }
    },
    "resultTypes": {
      "taxon_id": {"facet.field": "{!facet.limit='50' facet.mincount='0' key='taxon_id'}taxon_id"},
      "fixed_200__bin": {"facet.field": "{!facet.limit='-1' facet.mincount='1' key='fixed_200__bin'}fixed_200__bin"}
    }
  },
  
  {
    name: 'No results',
    "q": "",
    "filters": {
      "NCBITaxon__ancestors:147380": {
        "fq": "NCBITaxon__ancestors:147380"
      },
      "_terms:(PAD4)": {
        "fq": "_terms:(PAD4)"
      }
    },
    "resultTypes": {
      "taxon_id": {"facet.field": "{!facet.limit='50' facet.mincount='0' key='taxon_id'}taxon_id"},
      "fixed_200__bin": {"facet.field": "{!facet.limit='-1' facet.mincount='1' key='fixed_200__bin'}fixed_200__bin"}
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
      taxonomy.setResults(results.fixed_200__bin);
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

