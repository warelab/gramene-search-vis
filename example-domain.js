var React = require('react');
var d3 = require('d3');

var DomainVis = require('./domain.js');

var exampleDomains = {}; // TODO example from andrew

//var visComponent = new Vis({taxonomy: taxonomy, results: results, derp: derp});
var AppComponent = React.createClass({

  render: function () {
   return (
      <div>
        <DomainVis domains={exampleDomains} />
      </div>
    );
  }
});

// TODO: in the real world we will pass in the search object so we can infer correct tree state from taxonomy filters.
React.render(<AppComponent />, document.getElementById('the-test-vis'));

