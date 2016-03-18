'use strict';

var $ = require('jquery');
var React = require('react');
var WareTreeGeneDistribution = require('./kb/WareTreeGeneDistribution');
var debounce = require('lodash.debounce');
var d3 = require('d3');
var ReactFauxDOM = require('react-faux-dom');

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

  },

  shouldComponentUpdate: function (newProps, newState) {
    this.updateVis(newProps.taxonomy);
    return false;
  },

  undebouncedUpdateVis: function(taxonomy) {
    this.wareTreeGeneDist.setDataset(taxonomy.children[0]);
  },

  uniqueFunc :       function (d) {

        if (d.id == undefined) {

            var names = [];

            var p = d;

            do {

              names.unshift(p.model.name);
              var p = p.parent;
            } while (p != undefined);

            d.id = names.join('/');
        }

        return d.id;

    },

  render: function () {

    var self = this;

    var $tree = {
      options : {
        debug: false,

        xGutter: 0,
        xPadding: 0,
        yGutter: 0,
        yPadding: 0,

        bgColor: 'none',

        red: undefined,
        blue: undefined,

        distance: 100,

        redBlue: false,

        strokeWidth: 1.5,
        transitionTime: 500,
        lineStyle: 'curve', // curve / straight / square / step

        fixed: 0,
        displayStyle: 'NTnt',

        nodeHeight: 15,
        labelSpace: 10,
        circleRadius: 2.5,
        circleStroke: 'steelblue',
        openCircleFill: 'lightsteelblue',
        closedCircleFill: '#FFF',

        lineStroke : '#ccc',

        staticWidth : false,
        staticHeight : false,
        canShrinkWidth : true,
      }
    }

    //magic numbers! These'll become attributes at some point. Probably!
    var nodeHeight = 12;
    var treeWidth = 960;
    var treeHeight = 100;

    if(this.weCalledRenderAlready) {
      console.warn("We called Vis.render already for this instance. Why is it being called again?");
    }
    this.weCalledRenderAlready = true;

    var layout = d3.layout.cluster().separation(function(a,b){return 1}).size([treeHeight, treeWidth])
    var nodes = layout.nodes(this.props.taxonomy.children[0]).reverse();

    var edgeCount = 0;
    var maxDepth = 0;

    nodes.forEach(function(v,i) {
      if (!v.children || ! v.children.length) {
        edgeCount++;
        var myDepth = 0;
        var p = v.parent;
        while (p != undefined) {
          myDepth++;
          p = p.parent;
        }
        if (myDepth > maxDepth) {
          maxDepth = myDepth;
        }
      }
    })

    var newTreeHeight = edgeCount * nodeHeight;
    if (newTreeHeight != treeHeight) {
      treeHeight = newTreeHeight;
      layout.size([treeHeight, treeWidth])
      nodes = layout.nodes(this.props.taxonomy.children[0]).reverse();
    }

    var links = layout.links(nodes);


    var svg = ReactFauxDOM.createElement('svg');
    var d3svg = d3.select(svg);
    d3svg.style({ width : treeWidth + 'px', height : treeHeight + 'px', border : '1px solid red'});

    var node = d3svg.selectAll('g.node').data(nodes, this.uniqueFunc);

    var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr('data-node-id', function (d) { return d.it } )
      .attr('opacity', 1)
      .attr("transform", function (d) {
        var dy = 0;
        if (! d.children) {
          dy = maxDepth;
        }
        else {
          var p = d.parent;
          while (p != undefined) {
            dy++;
            p = p.parent;
          }
        }

        dy *= 10;
        d.y = dy;

        return "translate(" + d.y + "," + d.x + ")";
      })
    ;

    nodeEnter.append("circle")
      .attr("class", "circle")
      .attr("r", $tree.options.circleRadius)
      .attr('style', 'cursor : pointer;')
      .attr('stroke', function(d) { return d.stroke || $tree.options.circleStroke})
      .style("fill", function(d) { return d._children ? $tree.options.openCircleFill : $tree.options.closedCircleFill; })

    nodeEnter.append("text")
      .attr('class', 'nodeText')
      .attr('data-text-id', function (d) { return d.id } )
      .attr('style', 'font-size : 11px;cursor : pointer;-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;')
      .attr("dy", ".35em")
      .attr("x", function (d) { return d.children ? 0 - $tree.options.labelSpace : $tree.options.labelSpace; })
      .attr("text-anchor", function (d) { return d.children ? "end" : "start"; })
      .text(function (d) {
          return d.children ? '' : d.model.name;
      })
      //.style("fill-opacity", 1e-6)
      .attr('fill', function (d) { return d.fill || 'black'})

    var scoreGroup = nodeEnter
      .append('g')
      .attr('transform', function(d) {
        return 'translate(210,0)'
      })

    scoreGroup.append("text")
      .attr('class', 'score')
      .attr('data-text-id', function (d) { return d.id } )
      .attr('style', 'font-size : 11px;cursor : pointer;-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;')
      .attr("dy", ".35em")
      .attr("x", -10)//function (d) { return d.children ? 0 - $tree.options.labelSpace : $tree.options.labelSpace; })
      .attr("text-anchor", 'end')
      .text(function (d) {

          return d.children ? '' : d.results().count;
      })
      //.style("fill-opacity", 1e-6)
      .attr('fill', function (d) { return d.fill || 'black'})

    scoreGroup
      .append('g')
      .attr('class', 'regionG')
      .each(function(d) {
        if (d.children) {
          return;
        }

        var regions = [];
        d.model.genome.eachRegion(function (region) {
          regions.push(region);
        });

        var bins = [];
        var genomeTotalScore = 0;
        var maxBinScore = 0;

        regions.forEach(
          function (region, idx) {
            region.eachBin(function (bin) {
              /*if (! bin.results || bin.results.count == 0) {
               return;
               }*/
              bin.regionObj = region;
              bins.push(bin);
              var score = bin.results ? bin.results.count : 0;
              genomeTotalScore += score;

              if (score > maxBinScore && region.name != 'UNANCHORED') {
                maxBinScore = score;
              }
            })
          }
        );

        var regionDomain = function (data) {

          var length = 0;
          var lastVal = {end: 0}
          data.forEach(
            function (val, idx) {
              length += val.size;
              val.start = lastVal.end;
              val.end = val.start + val.size;
              lastVal = val;
            }
          )

          return [0, length];
        }

        var xScale = d3.scale.linear()
          .domain( regionDomain(regions) )
          .range([0,600]);
var x = 0;
        var regionSelection = d3.select(this).selectAll('.region').data(regions, function(d) { return d.name });
        regionSelection
          .enter()
          .append('rect')
          .attr('class', 'region')
          //.attr('opacity', 0)

          .attr('x', function(d) { return xScale(d.start) } )
          .attr('y', -4)
          .attr('width', function(d) { return xScale(d.size) } )
          .attr('height', 8)
          .attr('fill', function(d) {return d.color = x++ % 2 ? '#547b74' : '#9abe6c'})
        ;

        var binSelection = d3.select(this).selectAll('.bin').data(bins);
        binSelection
          .enter()
          .append('rect')
          .attr('class', 'bin')
          //.attr('opacity', 0)
          //.attr('x', bounds.size.width)
          .attr('x', function(d) { return Math.round(xScale(d.start + d.regionObj.start)) } )
          .attr('y', -4)
          //.attr('width', 0)
          .attr('width', function (d) { return Math.round(xScale((d.end - d.start))) })
          .attr('height', 8)
          .attr('style', 'cursor : pointer')
          .attr('fill', function(d,i) {
            if (d.regionObj.name == 'UNANCHORED') {
              return '#dde5e3';
            }

            var colorScale = d3.scale.linear().domain([0, 1]).range(['#FFFFFF', d.regionObj.color])
            var scale = d3.scale.linear().domain([0, 1]).range([colorScale(.5), d.regionObj.color]);
            if (!d.results || d.results.count === 0) {
              return colorScale(.25);
            }
            else {
              return scale(d.results.count / maxBinScore);
            }
          })

        //console.log("REGIONAL B ", d, this);
        //d3.select(this).append('rect').attr('y', -4).attr('width', 610).attr('height', 8).attr('fill','none').attr('stroke', 'blue').attr('stroke-width', '1px').attr('x', $tree.options.labelSpace)
      })
    ;

      var link = d3svg.selectAll('path.link').data(links, function (d) { return d.target.id } );

      link
        .enter()
        .insert('path', 'g')
        .attr("class", "link")
        .attr('data-link-id', function (d) { d.id } )
        .attr('fill', 'none')
        .attr('stroke', function (d) { return d.stroke || $tree.options.lineStroke})
        .attr("d", function(d) {

            return "M" + d.source.y + ',' + d.source.x +
                'L' + d.source.y + ',' + d.target.x +
                'L' + d.target.y + ',' + d.target.x
                ;
        })


    return svg.toReact();

  }

});

module.exports = Vis;
