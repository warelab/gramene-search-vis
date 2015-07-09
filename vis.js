'use strict';

var $ = require('jquery');
var React = require('react');
var WareTreeGeneDistribution = require('./kb/WareTreeGeneDistribution');

var _counterForVisId = 0;

var Vis = React.createClass({
  propTypes: {
    taxonomy: React.PropTypes.object.isRequired,
    onSubtreeCollapse: React.PropTypes.function,
    onSubtreeExpand: React.PropTypes.function,
    onTreeRootChange: React.PropTypes.function,
    onGeneSelection: React.PropTypes.function
  },

  componentWillMount: function () {
    this.visId = "vis" + _counterForVisId++;
  },

  componentDidMount: function () {
    var props = this.props;
    this.wareTreeGeneDist = WareTreeGeneDistribution.call(
      $("." + this.visId),
      {
        dataset: this.props.taxonomy.children[0],
        taxonClick: function (d, node) {
          console.log("I clicked on", d, " and it is now : ", this.nodeState(d));
        },
        taxonDblClick: function (d, isRoot) {
          console.log("III double clicked on", d, " and it is now : ", this.nodeState(d), " and is the root : ", isRoot);
        },
        subtreeCollapse : function(d) {
            console.log("collapsed under ", d);
            props.onSubtreeCollapse(d);
        },
        subtreeExpand : function(d) {
            console.log("expanded under ", d);
            props.onSubtreeExpand(d);
        },
        treeRootChange : function(d) {
            console.log('changed root to ', d);
            props.onTreeRootChange(d);
        },
        geneSelection : function(bins) {
            console.log("I SELECTED THESE BINS : ", bins);
            props.onGeneSelection(bins);
        },
      }
    )
  },

  shouldComponentUpdate: function (newProps, newState) {
    this.wareTreeGeneDist.setDataset(newProps.taxonomy.children[0]);
    return false;
  },

  render: function () {
    return React.DOM.div(
      {className: "ware-tree-gene " + this.visId}
    );
  }
});

module.exports = Vis;
