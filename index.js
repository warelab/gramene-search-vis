var d3 = require('d3');
var taxonomyGetter = require('gramene-taxonomy-with-genomes');
var search = require('gramene-search-client').client;
var Q = require('q');

var $ = require('jquery');

require('./kb/WareTreeGeneDistribution.js');

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

//var height = 2000, width = 960;
var width = 960;

   var $div = $.jqElem('div')
        .css({width : width})
    ;

   $('body').append($div);

    Q.all([
      taxonomyGetter.get(), // FOR NOW, use local data
      search.geneSearch(exampleQuery)
    ]).spread(function (taxonomy, results) {
      taxonomy.setBinType('fixed', 200);
      taxonomy.setResults(results.fixed_200_bin);

taxonomy = taxonomy.children[0];
//delete taxonomy.parent;


$div.WareTreeGeneDistribution({ dataset : taxonomy });

;
}).catch(function (err) {
  console.error(err);
});
