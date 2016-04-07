'use strict';

var $ = require('jquery');
var React = require('react');
var d3 = require('d3');
var ReactDOM = require('react-dom');

var _counterForVisId = 0;

var Vis = React.createClass({
  propTypes: {
    taxonomy          : React.PropTypes.object.isRequired,
    onSubtreeCollapse : React.PropTypes.func,
    onSubtreeExpand   : React.PropTypes.func,
    onTreeRootChange  : React.PropTypes.func,
    onGeneSelection   : React.PropTypes.func
  },

  getDefaultProps : function() {
    return {
      transitionTime  : 500,

      labelSpace      : 10,
      circleRadius    : 2.5,
      circleStroke    : '#547b74',
      openCircleFill  : '#547b74',
      closedCircleFill: '#FFF',

      circleStroke    : '#547b74',

      lineStroke      : '#dde5e3',

      highlightColor  : '#ea8e75',
      dragColor       : '#ea8e75',
      dragStrokeColor : '#fff2a7',

      svgID : 1,
    }
  },

  uniqueFunc : function (d) {

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

  selectorForVisId : function(id, type) {
    return '[data-vis-' + type + '-id="' + id + '"]';
  },

  render : function() {

    return (
      <div>
        <svg ref = 'svg'></svg>
        <div ref = 'tooltip'
          style = {{
            position              : 'absolute',
            'maxWidth'            : '300px',
            height                : 'auto',
            padding               : '10px',
            'backgroundColor'     : 'white',
            'WebkitBorderRadius'  : '10px',
            'MozBorderRadius'     : '10px',
            'borderRadius'        : '10px',
            'WebkitBoxShadow'     : '4px 4px 10px rgba(0, 0, 0, 0.4)',
            'MozBoxShadow'        : '4px 4px 10px rgba(0, 0, 0, 0.4)',
            'boxShadow'           : '4px 4px 10px rgba(0, 0, 0, 0.4)',
            'pointerEvents'       : 'none',
            'display'             : 'none',
            'fontFamily'          : 'sans-serif',
            'fontSize'            : '12px',
            'lineHeight'          : '20px',
          }}
        ></div>
      </div>
    );
  },

  componentDidMount : function() {
    this.prepare(ReactDOM.findDOMNode(this.refs.svg));
  },

  prepare: function (svg) {

    var self = this;

    var duration = this.initialized ? self.props.transitionTime : 0;

    //magic numbers! These'll become attributes at some point. Probably!
    var nodeHeight = 12;
    var treeWidth = 960;
    var treeHeight = 100;

    var dataset = this.dataset || this.props.taxonomy.children[0];
    this.dataset = dataset;

    var maxScore = dataset.globalResultSetStats().maxProportion,
    maxRange = maxScore === 1 ? 2 : 5;

    var strokeScale = d3.scale.linear()
      .domain([0, maxScore])
      .range([.5, maxRange]);

    var layout = d3.layout.cluster().separation(function(a,b){return 1}).size([treeHeight, treeWidth])
    var nodes = layout.nodes(dataset).reverse();

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
      nodes = layout.nodes(dataset).reverse();
    }

    var links = layout.links(nodes);


    var d3svg = d3.select(svg);
    d3svg
      .transition().duration(duration)
        .style({ width : treeWidth + 'px', height : treeHeight + 'px'})
        .attr('data-vis-svg-id', self.props.svgID);

    var node = d3svg.selectAll('g.node').data(nodes, this.uniqueFunc);

    var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr('data-vis-node-id', function (d) { return d.id } )
      .attr('opacity', 1)
      .attr("transform", function(d) { return self.nodeTranslate(d.parent || d, maxDepth) })
    ;

    node
      .transition().duration(duration)
      .attr("transform", function(d) { return self.nodeTranslate(d, maxDepth) } )
    ;

    nodeEnter.append("circle")
      .attr("class", "circle")
      .attr("r", self.props.circleRadius)
      .attr('style', 'cursor : pointer;')
      .on('mouseover', self.highlightTree)
      .on('mouseout', self.dehighlightTree)
      .on('click', self.handleClick)
    ;

    node.selectAll('circle')
      .attr('stroke', function(d) { return d.stroke || self.props.circleStroke})
      .style("fill", function(d) { return d._children ? self.props.openCircleFill : self.props.closedCircleFill })
    ;

    nodeEnter.append("text")
      .attr('class', 'nodeText')
      .attr('data-vis-text-id', function (d) { return d.id } )
      .style(
        {
          'font-size'             : '11px',
          'cursor'                : 'pointer',
          '-webkit-touch-callout' : 'none',
          '-webkit-user-select'   : 'none',
          '-khtml-user-select'    : 'none',
          '-moz-user-select'      : 'none',
          '-ms-user-select'       : 'none',
          'user-select'           : 'none'
        }
      )
      .attr("dy", ".35em")
      .on('mouseover', self.highlightTree)
      .on('mouseout', self.dehighlightTree)
    ;

    node.selectAll('.nodeText')
      .transition().duration(duration)
      .text(function (d) {
        return d.children ? '' : d.model.name;
      })
      .attr('fill',         function (d) { return d.fill || 'black'})
      .attr("text-anchor",  function (d) { return d.children ? "end" : "start" })
      .attr("x",            function (d) { return d.children ? 0 - self.props.labelSpace : self.props.labelSpace })
    ;

    var scoreGroup = nodeEnter
      .append('g')
      .attr('transform', function(d) {
        return 'translate(210,0)'
      })
    ;

    scoreGroup.append("text")
      .attr('class', 'score')
      .attr('data-vis-text-id', function (d) { return d.id } )
      .attr('style', 'font-size : 11px;cursor : pointer;-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;')
      .attr("dy", ".35em")
      .attr("x", -10)
      .attr("text-anchor", 'end')
    ;

    node.selectAll('.score')
      .transition().duration(duration)
      .text(function (d) {
          return d.children ? '' : d.results().count
      })
      .attr('fill', function (d) { return d.fill || 'black'})
    ;

    var drag = d3.behavior.drag()
      .on('dragstart', function (d) {
        self.dragging = true;
        self.validDrag = true;
        d.highlightBox.attr('opacity', 0);
      })
      .on('drag', function (d) {
        var coordinates = [0, 0];
        coordinates = d3.mouse(this);
        var bounds = this.getBBox();

        if (coordinates[1] < -4 || coordinates[1] > bounds.height + 4) {
          self.hideToolTip();
          self.validDrag = false;
        }
        else {
          self.validDrag = true;
        }

        if (self.lastSelection)  {
          self.lastSelection.bin.dragBox.attr('opacity', 0);
          delete self.lastSelection;
          self.dehighlightTree();
        }


      })
      .on('dragend', function (d) {
        self.dragging = false;

        if (self.validDrag) {

          if (!self.doubleClick) {
            var selectedBins = self.binsInRange(d.bins, d.regionObj.dragRange[0], d.regionObj.dragRange[1]);

            if (selectedBins.length) {
              setTimeout(function () {
                if (!self.doubleClick) {
                  if (self.lastSelection) {
                    self.lastSelection.bin.dragBox.attr('opacity', 0);
                  }
                  self.lastSelection = {
                    regionData : d.regionData,
                    start: selectedBins[0],
                    end: selectedBins[selectedBins.length - 1],
                    bin : d,
                  };
                  if (self.props.onGeneSelection) {
                    self.props.onGeneSelection(self.lastSelection);
                  }
                }
              }, 300);
            }
          }
        }
        else if (self.props.cancelSelectionCallback) {
          self.props.cancelSelectionCallback.call(self);
        }

        d.regionObj.dragRange = [];
      })
    ;

    scoreGroup
      .append('g')
      .attr('class', 'regionG')
      .each(function(d) {
        if (d.children) {
          return;
        }

        var regionData = d;

        var regions = [];
        d.model.genome.eachRegion(function (region) {
          regions.push(region);
        });

        var bins = [];
        var genomeTotalScore = 0;
        var maxBinScore = 0;

        var highlightBox  = d3.select(this).selectAll('.highlightBox').data([0]);
        var dragBox       = d3.select(this).selectAll('.dragBox').data([0]);

        regions.forEach(
          function (region, idx) {
            if (region.dragRange == undefined) {
              region.dragRange = [];
            }
            region.eachBin(function (bin) {
              bin.regionObj = region;
              bin.regionIdx = idx;
              bin.regionData = regionData;

              //these are necessary so we can get at them from the dragaction defined up above in a different scope.
              bin.highlightBox = highlightBox;
              bin.dragBox      = dragBox;
              bin.bins         = bins;

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
              length    += val.size;
              val.start = lastVal.end;
              val.end   = val.start + val.size;
              lastVal   = val;
            }
          )

          return [0, length];
        }

        var regionColors = ['#547b74', '#9abe6c'];
        var regionColorScales = [
          d3.scale.linear().domain([0, 1]).range(['#FFFFFF', regionColors[0]]),
          d3.scale.linear().domain([0, 1]).range(['#FFFFFF', regionColors[1]])
        ]

        var binColorScales = [
          d3.scale.linear().domain([0, 1]).range([regionColorScales[0](0.5), regionColors[0]]),
          d3.scale.linear().domain([0, 1]).range([regionColorScales[1](0.5), regionColors[1]])
        ]

        var xScale = d3.scale.linear()
          .domain( regionDomain(regions) )
          .range([0,600]);

        var regionSelection = d3.select(this).selectAll('.region').data(regions, function(d) { return d.name });
        regionSelection
          .enter()
          .append('rect')
          .attr('class', 'region')
          .attr('data-vis-region-id', function (d) { return d.name } )
          .attr('x', function(d) { return xScale(d.start) } )
          .attr('y', -4)
          .attr('width', function(d) { return xScale(d.size) } )
          .attr('height', 8)
          .attr('fill', function(d, i) {return regionColorScales[i % 2](0.25) })
          .attr('stroke', self.props.highlightColor)
          .attr('stroke-width', 0)
        ;

        var binSelection = d3.select(this).selectAll('.bin').data(bins);

        var initialBox = undefined;
        var initialBin = undefined;

        binSelection
          .enter()
          .append('rect')
          .attr('class', 'bin')
          .attr('x', function(d) { return Math.round(xScale(d.start + d.regionObj.start)) } )
          .attr('y', -4)
          .attr('width', function (d) { return Math.round(xScale((d.end - d.start))) })
          .attr('height', 8)
          .attr('data-start', function (d) { return d.start + d.regionObj.start})
          .attr('data-end', function (d) { return d.end + d.regionObj.start})
          .attr('style', 'cursor : pointer')
          .attr('fill', function(bin,i) {
            if (bin.regionObj.name == 'UNANCHORED') {
              return '#dde5e3';
            }

            if (!bin.results || bin.results.count === 0) {
              return regionColorScales[bin.regionIdx % 2](.25);
            }
            else {
              return binColorScales[bin.regionIdx % 2](bin.results.count / maxBinScore);
            }
          })
          .on('mousedown', function(bin) {
            //double clicks should select an entire region
            if (self.singleClick) {
              self.singleClick = false;
              self.doubleClick = true;

              var binBounds = self.binBoundsForRegion(initialBin.regionObj, bins);

              var firstBin    = binBounds[0];
              var lastBin     = binBounds[1];
              var lastStart   = lastBin.start + lastBin.regionObj.start;
              var firstStart  = firstBin.start + firstBin.regionObj.start;

              var firstBox    = d3svg.selectAll('[data-start="' + firstStart + '"]')[0][0].getBBox();

              var lastBox     = d3svg.selectAll('[data-start="' + lastStart + '"]')[0][0].getBBox();

              dragBox.attr('x', firstBox.x);
              dragBox.attr('width', lastBox.x + lastBox.width - firstBox.x);

              if (self.lastSelection) {
                self.lastSelection.bin.dragBox.attr('opacity', 0);
              }

              self.lastSelection = {
                regionData : regionData,
                start: firstBin,
                end  : lastBin,
                bin : bin,
              };

              if (self.props.onGeneSelection) {
                self.props.onGeneSelection(self.lastSelection);
              }

            }
            else {
              self.singleClick = true;
              self.doubleClick = false;

              setTimeout(function () {
                if (self.singleClick) {
                  self.singleClick = false;
                }
              }, 250);

              initialBox = this.getBBox();
              initialBin = bin;

              dragBox.attr('x', initialBox.x)
              dragBox.attr('width', initialBox.width);
              dragBox.attr('visibility', 'visible');

              bin.regionObj.dragRange = [bin.start + bin.regionObj.start, bin.end + bin.regionObj.start];
              //if (self.props.startSelectionCallback) {
              //  self.props.startSelectionCallback.call(self);
              //}
            }
          })
          .on('mouseenter', function(bin) {

            self.highlightTree(regionData);

            if (! self.dragging) {
              highlightBox
                .transition()
                .duration(100)
                .attr('opacity', 1);
            }
            else {
              var box = this.getBBox();
              if (bin.regionObj !== initialBin.regionObj) {

                var binBounds = self.binBoundsForRegion(initialBin.regionObj, bins);

                var firstBin = binBounds[0];
                var lastBin = binBounds[1];

                if (box.x <= initialBox.x) {
                  bin = firstBin;
                }
                else if (box.x > initialBox.x) {
                  bin = lastBin;
                }

                var pos = bin.start + bin.regionObj.start;
                var node = d3svg.selectAll('[data-start="' + pos + '"]');

                if (node) {
                  box = node[0][0].getBBox();
                }

              }

              if (box.x <= initialBox.x) {
                bin.regionObj.dragRange[0] = bin.start + bin.regionObj.start;
                bin.regionObj.dragRange[1] = initialBin.end + initialBin.regionObj.start;
              }
              if (box.x >= initialBox.x) {
                bin.regionObj.dragRange[0] = initialBin.start + initialBin.regionObj.start;
                bin.regionObj.dragRange[1] = bin.end + bin.regionObj.start;
              }

              var selectedBins  = self.binsInRange(bins, bin.regionObj.dragRange[0], bin.regionObj.dragRange[1]);
              var lastBin       = selectedBins[selectedBins.length - 1];
              var lastStart     = lastBin.start + lastBin.regionObj.start;
              var firstStart    = selectedBins[0].start + selectedBins[0].regionObj.start;

              var firstBox      = d3svg.selectAll('[data-start="' + firstStart + '"]')[0][0].getBBox();
              var lastBox       = d3svg.selectAll('[data-start="' + lastStart + '"]')[0][0].getBBox();

              dragBox.attr('x', firstBox.x);
              dragBox.attr('width', lastBox.x + lastBox.width - firstBox.x);
              dragBox.attr('visibility', 'visible');

              var score = 0;
              selectedBins.forEach(
                function (bin, idx) {
                  if (bin.results) {
                    score += bin.results.count;
                  }
                }
              )

              var units = (score > 1) ? ' genes' : ' gene';
              self.showToolTip({label: bin.regionObj.name + ':' + (bin.regionObj.dragRange[0] - bin.regionObj.start) + '-' + (bin.regionObj.dragRange[1] - bin.regionObj.start) + ' ' + score + units})

            }

          })
          .on('mouseout', function(bin) {
            if (! self.dragging) {
              highlightBox
                .transition()
                .duration(100)
                .attr('opacity', 0)
            }
            self.dehighlightTree(d);
            if (self.lastSelection) {
              self.highlightTree(self.lastSelection.regionData);
            }
          })
          .on('mouseover', function(b) {

            if (self.dragging) {
              return;
            }

            var score = b.results ? b.results.count : 0;
            if (score) {
              var units = (score > 1) ? ' genes' : ' gene';
              self.showToolTip({label: b.regionObj.name + ':' + b.start + '-' + b.end + ' ' + score + units})
            }
            else {
              self.showToolTip({label: b.regionObj.name + ':' + b.start + '-' + b.end})
            }
          })
          .call(drag)
        ;

        dragBox
          .enter()
          .append('rect')
          .attr('class', 'dragBox')
          .attr('visibility', 'hidden')
          .attr('height', 8)
          .attr('width', 0)
          .attr('x', 0)
          .attr('y', -4)
          .attr('fill', self.props.dragColor)
          .attr('stroke', self.props.dragStrokeColor)
          .attr('stroke-width', 2)
          .attr('stroke-opacity', 0.6)
          .attr('fill-opacity', 0.6)
          .attr('pointer-events', 'none')
        ;

        highlightBox.enter()
          .append('rect')
          .attr('class', 'highlightBox')
          //.attr('visibility', 'hidden')
          .attr('opacity', 0)
          .attr('height', 8)
          .attr('width', 600)
          .attr('x', 0)
          .attr('y', -4)
          .attr('stroke', self.props.highlightColor)
          .attr('stroke-width', 2)
          .attr('fill', 'none')
          .attr('pointer-events', 'none')
        ;
      })
    ;

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit()
      .transition().duration(duration)
        .attr('opacity', 0)
        .attr("transform", function (d) {
          var y = d.parent && d.parent.y
            ? d.parent.y
            : d.y;
          var x = d.parent && d.parent.x
            ? d.parent.x
            : d.x;

          return "translate(" + y + "," + x + ")";
        })
      .remove()
    ;

    nodeExit.select("circle").attr("r", 1e-6);
    nodeExit.select("text").style("fill-opacity", 1e-6);

    nodeExit.each(function (d, i) {
      if (self.props.nodeExitCallback) {
        self.props.nodeExitCallback.call(self, d, i, this, duration);
      }
    });

    var link = d3svg.selectAll('path.link').data(links, function (d) { return d.target.id } );

    link
      .enter()
      .insert('path', 'g')
      .attr("class", "link")
      .attr('data-vis-link-id', function (d) { return d.target.id } )
      .attr('fill', 'none')
      .attr('stroke', function (d) { return d.stroke || self.props.lineStroke})
      .attr('stroke-width', function(d) {
        var node        = d.target,
            targetScore = node.results().proportion;
        return strokeScale(targetScore);
      })
      .attr('d', function(d) { return self.diagonal(d.parent || d) })
      .on('mouseover', function(d) {
        self.highlightTree(d.target)
      })
      .on('mouseout', function(d) {
        self.dehighlightTree(d)
      })
    ;

    link.transition().duration(duration).attr("d", self.diagonal)

     // Transition exiting nodes to the parent's new position.
    link.exit().transition()
      .duration(duration)
      .attr('opacity', 0)
      .attr("d", function (d) {
        var o = {x: d.source.x, y: d.source.y};
        return self.diagonal({source: o, target: o});
      })
      .remove();

    this.initialized = true;

  },

  nodeTranslate : function (d, maxDepth) {
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

    if ( this.originalRoot) {
      d.y += 10;
    }

    if (d.x == undefined) {
      d.x = 0;
    }

    return "translate(" + d.y + "," + d.x + ")";
  },

  diagonal : function(d) {

    return  "M" + d.source.y + ',' + d.source.x +
            'L' + d.source.y + ',' + d.target.x +
            'L' + d.target.y + ',' + d.target.x
  },

  highlightTree : function(d) {

    var node = d3.select(this.selectorForVisId(d.id, 'node'));

    node.selectAll('.nodeText')
      .attr('fill', '#ea8e75')
      .attr('font-style', 'italic')
    ;

    var nodes = d.id.split('/');

    var highlighted = {};

    while (nodes.length) {
      var nodeID = nodes.join('/');

      highlighted[nodeID] = true;

      d3.selectAll(this.selectorForVisId(nodeID, 'link')).attr('stroke','#ea8e75')

      nodes.pop();
    }


    d3.select(this.selectorForVisId(this.props.svgID, 'svg')).selectAll('.link').sort(
      function(a,b) {
        if (! a || ! b) {
          return 0;
        }
        if (highlighted[a.target.id]) {
          return 1;
        }
        if (highlighted[b.target.id]) {
          return -1;
        }
        else {
          return 0;
        }
      }
    );

    if (! self.dragging) {
      if (d.children || d._children) {
        this.showToolTip({label : d.model.name + ' - ' + d.stats().genes + ' genes'})
      }
    }
  },

  dehighlightTree : function(d) {
    d3.selectAll('.nodeText')
      .attr('fill', 'black')
      .attr('font-style', '')
    ;

    d3.selectAll('.link').attr('stroke', this.props.lineStroke);
    this.hideToolTip();
  },

  handleClick : function(d) {
    var self = this;

    if (this.oneClick) {
      this.oneClick = false;
      this.collapseTree(d);
    }
    else {
      this.oneClick = true;
      setTimeout( function() {
        if (self.oneClick) {
          self.oneClick = false;
          self.rerootTree(d);
        }
      }, 250);
    }
  },

  collapseTree : function(d) {

    if (d.children != undefined) {
      d._children = d.children;
      delete d.children;
      d.open = false;

      if (this.props.onSubtreeCollapse) {
        this.props.onSubtreeCollapse(d);
      }

    }
    else {
      d.children = d._children;
      delete d._children;
      d.open = true;

      if (this.props.onSubtreeExpand) {
        this.props.onSubtreeExpand(d);
      }
    }

    if (this.props.taxonClick) {
      this.props.taxonClick.call(this, d);
    }

    this.prepare(ReactDOM.findDOMNode(this.refs.svg));
  },

  rerootTree : function(d) {

    var self = this;

    //clicks on the root node shouldn't do anything, so bail out.
    if (d.model.name == 'Eukaryota') {
      return;
    }

    var isRoot    = true;
    var lastRoot  = undefined;

    var parent = d;
    if (this.originalRoot == undefined || this.lastClicked !== d) {
      if (this.originalRoot == undefined) {
        this.originalRoot = this.dataset;
        this.subRoot      = d;
      }

      this.lastClicked  = d;
      lastRoot          = this.originalRoot;
    }
    else {
      lastRoot          = d;
      d                 = this.originalRoot;
      this.originalRoot = undefined;
      this.lastClicked  = undefined;
      isRoot            = false;
    }

    self.relayout(d);

    d.stroke = this.originalRoot ? '#ea8e75' : '#547b74';

    this.dataset = d;
    this.prepare(ReactDOM.findDOMNode(this.refs.svg));

    if (self.props.taxonDblClick != undefined) {
      self.props.taxonDblClick(d, isRoot);
    }

    if (self.props.onTreeRootChange) {
      self.props.onTreeRootChange(d, lastRoot);
    }

  },

  relayout : function(d) {

    var self = this;

    delete d.depth;
    delete d.x;
    delete d.x0;
    delete d.y;
    delete d.y0;
    delete d.stroke;
    if (d.model.name != 'Eukaryota') {
      delete d.parent;
    }

    if (d.children) {
      $.each(
        d.children,
        function (idx, kid) {
          self.relayout(kid);
        }
      )
    }

    if (d._children) {
      $.each(
        d._children,
        function (idx, kid) {
          self.relayout(kid);
        }
      )
    }

    return d;
  },

  showToolTip : function showToolTip (args) {

    if (args.event == undefined) {
      args.event = d3.event;
    }

    d3.select(ReactDOM.findDOMNode(this.refs.tooltip))
      .style('display', 'block')
      .html(args.label)
      .style("left", (args.event.pageX + 10) + "px")
       .style("top", (args.event.pageY - 10) + "px")
      .style('max-width', (args.maxWidth || '300') + 'px')
    },

    hideToolTip : function hideToolTip (args) {
      d3.select(ReactDOM.findDOMNode(this.refs.tooltip)).style('display', 'none');
    },

    binsInRange: function (bins, start, end) {
      var results = [];

      bins.forEach(
        function (bin, idx) {
          if (bin.start + bin.regionObj.start >= start && bin.end + bin.regionObj.start <= end) {
            results.push(bin);
          }
        }
      )

      return results;

    },

  binBoundsForRegion: function (region, bins) {
    var firstBin    = undefined;
    var lastBin     = undefined;
    var foundRegion = false;

    for (var i = 0; i < bins.length; i++) {
      var bin = bins[i];

      if (bin.regionObj === region && firstBin == undefined) {
        firstBin = bin;
        foundRegion = true;
      }

      if (foundRegion && bin.regionObj !== region) {
        break;
      }

      lastBin = bin;

    }

    return [firstBin, lastBin];

  },


});

module.exports = Vis;
