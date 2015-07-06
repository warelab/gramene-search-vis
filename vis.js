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
    this.wareTreeGeneDist = WareTreeGeneDistribution.call(
        $(el),
        {
            dataset: this.props.taxonomy.children[0],
            taxonClick : function(d) {
                console.log("I clicked on", d, " and it is now : ", this.nodeState(d));
            },
            taxonDblClick : function(d, isRoot) {
                console.log("I double clicked on", d, " and it is now : ", this.nodeState(d), " and is the root : ", isRoot);
            },
            subtreeCollapse : function(d) {
                console.log("collapsed under ", d);
            },
            subtreeExpand : function(d) {
                console.log("expanded under ", d);
            },
            treeRootChange : function(d) {
                console.log('changed root to ', d);
            },
        }
    )
  },

  componentDidUpdate: function() {
    this.wareTreeGeneDist.setDataset(this.props.taxonomy.children[0]);
  },

  render: function() {
    return React.createElement(
      "div",
      {className: "ware-tree-gene"},
      "Hello, World"
    );
  }
});

module.exports = Vis;
