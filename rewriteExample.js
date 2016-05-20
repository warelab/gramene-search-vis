import React from "react";
import ReactDOM from "react-dom";
import taxonomyGetter from "gramene-taxonomy-with-genomes";
import {client} from "gramene-search-client";
import Q from "q";
import App from "./App.jsx";

// Example query objects.
// This is usually generated in code by gramoogle.
// These queries:
//   1. asks for all genes with a particular filter (or no filter)
//   2. requests binned results that will match the bin configuration
//      of the taxonomy object
//   3. requests also to get taxonomy facet.
var exampleQueries = [

  {
    name: 'NB-ARC',
    filters: {
      "domains__ancestors:2182": {
        "category": "InterPro",
        "display_name": "NB-ARC",
        "fq": "domains__ancestors:2182"
      }
    },
    "resultTypes": {
      "taxon_id": {"facet.field": "{!facet.limit='50' facet.mincount='0' key='taxon_id'}taxon_id"},
      "fixed_1000__bin": {"facet.field": "{!facet.limit='-1' facet.mincount='1' key='fixed_1000__bin'}fixed_1000__bin"}
    }
  },
  {
    name: 'No filters',
    "q": "",
    "filters": {},
    "resultTypes": {
      "taxon_id": {"facet.field": "{!facet.limit='50' facet.mincount='0' key='taxon_id'}taxon_id"},
      "fixed_1000__bin": {"facet.field": "{!facet.limit='-1' facet.mincount='1' key='fixed_1000__bin'}fixed_1000__bin"}
    }
  },


  {
    name: 'PAD4',
    "q": "",
    "filters": {
      "_terms:PAD4": {
        "fq": "_terms:PAD4"
      }
    },
    "resultTypes": {
      "taxon_id": {"facet.field": "{!facet.limit='50' facet.mincount='0' key='taxon_id'}taxon_id"},
      "fixed_1000__bin": {"facet.field": "{!facet.limit='-1' facet.mincount='1' key='fixed_1000__bin'}fixed_1000__bin"}
    }
  },

  {
    name: 'Species filter',
    "q": "",
    "filters": {
      "taxonomy__ancestors:3702": {
        "fq": "taxonomy__ancestors:3702"
      }
    },
    "resultTypes": {
      "taxon_id": {"facet.field": "{!facet.limit='50' facet.mincount='0' key='taxon_id'}taxon_id"},
      "fixed_1000__bin": {"facet.field": "{!facet.limit='-1' facet.mincount='1' key='fixed_1000__bin'}fixed_1000__bin"}
    }
  },

  {
    name: 'No results',
    "q": "",
    "filters": {
      "taxonomy__ancestors:147380": {
        "fq": "taxonomy__ancestors:147380"
      },
      "_terms:PAD4": {
        "fq": "_terms:PAD4"
      }
    },
    "resultTypes": {
      "taxon_id": {"facet.field": "{!facet.limit='50' facet.mincount='0' key='taxon_id'}taxon_id"},
      "fixed_1000__bin": {"facet.field": "{!facet.limit='-1' facet.mincount='1' key='fixed_1000__bin'}fixed_1000__bin"}
    }
  }
];

var promises = exampleQueries.map(function (eg) {
  return client.geneSearch(eg);
});
promises.unshift(taxonomyGetter.get());

Q.all(promises).spread(function (taxonomy) {
  const exampleResults = Array.prototype.slice.call(arguments, 1);
  taxonomy.setBinType('fixed', 1000);
  ReactDOM.render(
      <App taxonomy={taxonomy}
           exampleQueries={exampleQueries}
           exampleResults={exampleResults}
      />,
      document.getElementById('the-test-vis')
  )
}).catch((e) => console.log(e.message, e.stack));

