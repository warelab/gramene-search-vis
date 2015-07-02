'use strict';

var $ = require('jquery');
var React = require('react');
var WareTreeGeneDistribution = require('./kb/WareTreeGeneDistribution');

var Vis = React.createClass({
  propTypes: {
    taxonomy: React.PropTypes.object.isRequired
  },

  componentDidMount: function() {
    var el = React.findDOMNode(this);
    this.wareTreeGeneDist = WareTreeGeneDistribution.call($(el), {dataset: this.props.taxonomy.children[0]})
  },

  componentDidUpdate: function() {
    //console.log("Need to update the chart somehow.", this.wareTreeGeneDist);
    this.wareTreeGeneDist.setDataset(this.props.taxonomy.children[this.props.derp]);
  },

  render: function() {
    return (
      <div className="ware-tree-gene">Hello, World</div>
    );
  }
});





module.exports = Vis;