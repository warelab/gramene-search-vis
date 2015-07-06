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
            taxonClick : function(d, node) {
                console.log("I clicked on", d, " and it is now : ", this.nodeState(d));
            },
            taxonDblClick : function(d, node, isRoot) {
                console.log("I double clicked on", d, " and it is now : ", this.nodeState(d), " and is the root : ", isRoot);
            }
        }
    )
  },

  componentDidUpdate: function() {
    this.wareTreeGeneDist.setDataset(this.props.taxonomy.children[0]);
  },

  render: function() {
    return (
      <div className="ware-tree-gene">Hello, World</div>
    );
  }
});





module.exports = Vis;
