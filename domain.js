'use strict';

var React = require('react');
var debounce = require('lodash.debounce');

var _counterForVisId = 0;

var DomainVis = React.createClass({
  propTypes: {

  },

  componentWillMount: function () {
    this.visId = "vis" + _counterForVisId++;
    this.updateVis = debounce(this.undebouncedUpdateVis, 200);
  },

  componentDidMount: function () {
    console.log("Will display visualization", this.visId);
    var props = this.props;
    var el = document.querySelector('.' + this.visId);

    // TODO do something here with the props and the element
  },

  shouldComponentUpdate: function (newProps, newState) {
    console.log("Updating visualization with new data.");
    this.updateVis(newProps.taxonomy);
    return false;
  },

  undebouncedUpdateVis: function(newData) {
    // TODO update the vis with the newData

  },

  render: function () {
    if(this.weCalledRenderAlready) {
      console.warn("We called Vis.render already for this instance. Why is it being called again?");
    }
    this.weCalledRenderAlready = true;
    return React.DOM.div(
      {className: "ware-domain " + this.visId}
    );
  }
});

module.exports = DomainVis;
