'use strict';

var $ = require('jquery');
var React = require('react');
var WareTreeGeneDistribution = require('./kb/WareTreeGeneDistribution');
var debounce = require('lodash.debounce');

var _counterForVisId = 0;

var Vis = React.createClass({
  propTypes: {
    taxonomy: React.PropTypes.object.isRequired,
    onSubtreeCollapse: React.PropTypes.func,
    onSubtreeExpand: React.PropTypes.func,
    onTreeRootChange: React.PropTypes.func,
    onGeneSelection: React.PropTypes.func
  },

  componentWillMount: function () {
    this.visId = "vis" + _counterForVisId++;
    this.updateVis = debounce(this.undebouncedUpdateVis, 200);
  },

  componentDidMount: function () {
    console.log("Will display visualization", this.visId);
    var props = this.props;
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
        subtreeCollapse : function(d) {
            console.log("collapsed under ", d);
            if (props.onSubtreeCollapse) {
                props.onSubtreeCollapse(d);
            }
        },
        subtreeExpand : function(d) {
            console.log("expanded under ", d);
            if (props.onSubtreeExpand) {
                props.onSubtreeExpand(d);
            }
        },
        treeRootChange : function(d, last) {
            console.log('changed root to ', d, ' from ', last);
            if (props.onTreeRootChange) {
              props.onTreeRootChange(d, last);
            }
        },
        geneSelection : function(bins) {
            console.log("I SELECTED THESE BINS : ", bins);
            if (props.onGeneSelection) {
                props.onGeneSelection(bins);
            }
        }
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
