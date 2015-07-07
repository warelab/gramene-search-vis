'use strict';

var $ = require('jquery');
var React = require('react');
var WareTreeGeneDistribution = require('./kb/WareTreeGeneDistribution');
var debounce = require('lodash.debounce');

var _counterForVisId = 0;

var Vis = React.createClass({
  propTypes: {
    taxonomy: React.PropTypes.object.isRequired,
    onSubtreeCollapse: React.PropTypes.function,
    onSubtreeExpand: React.PropTypes.function,
    onTreeRootChange: React.PropTypes.function
  },

  componentWillMount: function () {
    this.visId = "vis" + _counterForVisId++;
    this.updateVis = debounce(this.undebouncedUpdateVis, 200);
  },

  componentDidMount: function () {
    console.log("Will display visualization", this.visId);
    var reactProps = this.props;
    this.wareTreeGeneDist = WareTreeGeneDistribution.call(
      $("." + this.visId),
      {
        dataset: this.props.taxonomy.children[0],
        taxonClick: function (d) {
          console.log("I clicked on", d, " and it is now : ", this.nodeState(d));
        },
        taxonDblClick: function (d, isRoot) {
          console.log("I double clicked on", d, " and it is now : ", this.nodeState(d), " and is the root : ", isRoot);
        },
        subtreeCollapse : reactProps.onSubtreeCollapse || function() {},
        subtreeExpand : reactProps.onSubtreeExpand || function() {},
        treeRootChange : reactProps.onTreeRootChange || function() {}
      }
    )
  },

  shouldComponentUpdate: function (newProps, newState) {
    console.log("Updating visualization with new data.");
    this.updateVis(newProps.taxonomy);
    return false;
  },

  undebouncedUpdateVis: function(taxonomy) {
    this.wareTreeGeneDist.setDataset(taxonomy.children[0]);
  },

  render: function () {
    if(this.weCalledRenderAlready) {
      console.warn("We called Vis.render already for this instance. Why is it being called again?");
    }
    this.weCalledRenderAlready = true;
    return React.DOM.div(
      {className: "ware-tree-gene " + this.visId}
    );
  }
});

module.exports = Vis;
