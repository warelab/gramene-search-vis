'use strict';

var KBWidget = require('./kbaseVisWidget.js');
var d3 = require('d3');

module.exports = new KBWidget({

  name: "GeneDistribution",
  parent: "kbaseVisWidget",

  version: "1.0.0",
  options: {
    xScaleType: 'ordinal',
    overColor: 'yellow',
    strokeWidth: '2',

    xGutter: 0,
    yGutter: 0,
    xPadding: 0,
    yPadding: 0,
    debug: false,
    regionSaturation: 0.25,
    unachoredBinColor: 'lightgray',
    dragColor: 'red',
    dragStrokeColor: 'cyan',
    highlightColor: 'red',

    tooltipLeftOffset: 10,
    tooltipTopOffset: -15,

    colorScale: function (idx) {

      var c1 = d3.scale.category20();
      var c2 = d3.scale.category20b();
      var c3 = d3.scale.category20c();

      return function (idx) {

        if (idx < 20 || idx >= 60) {
          var color = c1(idx % 20)
          return color;
        }
        else if (idx < 40) {
          return c2(idx % 20)
        }
        else if (idx < 60) {
          return c3(idx % 20)
        }
      }
    },

    inset: 5,
    colorDomain: [0, 100],

    transitionTime: 200,

  },

  _accessors: [],

  binColorScale: function (data, maxColor) {

    var max = 0;

    data.forEach(
      function (bin, idx) {
        if (bin.results) {
          if (bin.results.count > max) {
            max = bin.results.count;
          }
        }
      }
    )

    return d3.scale.linear()
      .domain([0, max])
      .range(['#FFFFFF', maxColor])
  },

  renderXAxis: function () {},
  renderYAxis: function () {},

  domain: function (data) {

    var start = 1000000;
    var end = -1000000;

    for (var i = 0; i < data.length; i++) {

      if (data[i].end > end) {
        end = data[i].end
      }

      if (data[i].start < start) {
        start = data[i].start
      }

    }

    return [start, end];

  },

  regionDomain: function (data) {

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
  },

  setDataset: function (genome) {
    var regions = [];
    genome.eachRegion(function (region) {
      regions.push(region);
    });

    this._super(regions);
  },

  showHighlightBox: function () {
    this.highlightBox.attr('visibility', 'visible');

    if (this.options.showHighlightCallback) {
      this.options.showHighlightCallback.call(this);
    }

  },

  hideHighlightBox: function () {
    this.highlightBox.attr('visibility', 'hidden');

    if (this.options.hideHighlightCallback) {
      this.options.hideHighlightCallback.call(this);
    }
  },

  selectBins: function (bins) {

    this.dragBox.attr('visibility', 'visible');
  },

  showSelection: function () {
    this.dragBox.attr('visibility', 'visible');
  },

  hideSelection: function () {
    this.dragBox.attr('visibility', 'hidden');
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
    var firstBin = undefined;
    var lastBin = undefined;
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


  renderChart: function () {

    if (this.dataset() == undefined) {
      return;
    }
    var bounds = this.chartBounds();

    var regionDomain = this.regionDomain(this.dataset());

    var scale = d3.scale.linear()
      .domain(regionDomain)
      .range([0, bounds.size.width]);

    var $gd = this;

    var mouseAction = function (d, i) {
      this.on('mouseover', function (b, j) {

          if ($gd.dragging) {
            return;
          }

          if ($gd.options.tooltip) {
            $gd.options.tooltip(b);
          }
          else if (b.start && b.regionObj.name) {
            var score = b.results ? b.results.count : 0;
            if (score) {
              var units = (score > 1) ? ' genes' : ' gene';
              $gd.showToolTip({label: b.regionObj.name + ':' + b.start + '-' + b.end + ' ' + score + units})
            }
            else {
              $gd.showToolTip({label: b.regionObj.name + ':' + b.start + '-' + b.end})
            }
          }
        })
        .on('mouseout', function (b, j) {
          $gd.hideToolTip()
          $gd.hideHighlightBox();
        })
        .on('click', function (b, j) {
          if ($gd.options.binClick) {
            $gd.options.binClick.call($gd, b, this);
          }
        });
      return this;
    };

    var bins = [];
    var genomeTotalScore = 0;
    var maxBinScore = 0;

    this.dataset().forEach(
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

    var transitionTime = this.initialized
      ? this.options.transitionTime
      : 0;

    var regionsSelection = this.D3svg().select(this.region('chart')).selectAll('.regions').data([0]);
    regionsSelection.enter().append('g').attr('class', 'regions');

    var regionSelection = regionsSelection.selectAll('.region').data(this.dataset(), function (d) { return d.name});

    regionSelection
      .enter()
      .append('rect')
      .attr('class', 'region')
      .attr('opacity', 0)
      //            .attr('transform', function (d) {return "translate(" + scale(d.start) + ",0)"})
      .attr('x', bounds.size.width)
      .attr('y', 0)
      .attr('width', 0)
      .attr('height', $gd.options.binHeight || bounds.size.height)
      /*.on('mouseenter', function(e) {
       if (! $gd.dragging) {
       $gd.showHighlightBox();
       }
       })
       .on('mouseout', function(e) {
       $gd.hideHighlightBox();
       })*/
    ;


    regionSelection
    //.call(function (d) { return mouseAction.call(this, d) })
      .transition()
      .duration(transitionTime)
      .attr('opacity', 1)
      .attr('x', function (d) {return scale(d.start) })
      .attr('width', function (d) { return scale((d.size)) })
      .attr('fill', function (d, i) {
        var colorScale = d3.scale.linear().domain([0, 1]).range(['#FFFFFF', $gd.colorForRegion(d)])
        return colorScale($gd.options.regionSaturation);
      })
    ;

    regionSelection
      .exit()
      .transition()
      .duration(transitionTime)
      .attr('opacity', 0)
      .attr('x', bounds.size.width + 1)
      .attr('width', 0)
      .each('end', function (d) { d3.select(this).remove() });

    var binsSelection = this.D3svg().select(this.region('chart')).selectAll('.bins').data([0]);
    binsSelection.enter().append('g').attr('class', 'bins');

    var drag = d3.behavior.drag()
      .on('dragstart', function (d) {
        $gd.dragging = true;
        $gd.validDrag = true;
        //$gd.hideHighlightBox();
        $gd.highlightBox.attr('visibility', 'hidden');

      })
      .on('drag', function (d) {
        var coordinates = [0, 0];
        coordinates = d3.mouse(this);
        var bounds = this.getBBox();

        if (coordinates[1] < 0 || coordinates[1] > bounds.height) {
          $gd.hideSelection();
          $gd.hideToolTip();
          //$gd.hideHighlightBox();
          $gd.validDrag = false;
        }
        else {
          $gd.validDrag = true;
          $gd.showHighlightBox();
          //same hack. We need the callback to fire, but we don't actually want to show it.
          $gd.highlightBox.attr('visibility', 'hidden');
        }
      })
      .on('dragend', function (d) {
        $gd.dragging = false;
        //initialBin = undefined;

        if ($gd.validDrag) {


          if (!$gd.doubleClick) {
            var selectedBins = $gd.binsInRange(bins, dragRange[0], dragRange[1]);

            if (selectedBins.length) {
              setTimeout(function () {
                if (!$gd.doubleClick) {
                  if ($gd.options.endSelectionCallback) {
                    $gd.options.endSelectionCallback.call($gd, {
                      start: selectedBins[0],
                      end: selectedBins[selectedBins.length - 1]
                    });
                  }
                }
              }, 300);

            }
          }

        }
        else if ($gd.options.cancelSelectionCallback) {
          $gd.options.cancelSelectionCallback.call($gd);
        }

        //            $gd.hideSelection();
        dragRange = [];
      })

    var binSelection = binsSelection.selectAll('.bin').data(bins);

    var initialBox = undefined;
    var initialBin = undefined;
    var dragRange = [];

    binSelection
      .enter()
      .append('rect')
      .attr('class', 'bin')
      .attr('opacity', 0)
      .attr('x', bounds.size.width)
      .attr('y', 0)
      .attr('width', 0)
      .attr('height', $gd.options.binHeight || bounds.size.height)
      .attr('style', 'cursor : pointer')
      .on('mousedown', function (d) {

        //double clicks should select an entire region
        if ($gd.singleClick) {
          $gd.singleClick = false;
          $gd.doubleClick = true;

          var binBounds = $gd.binBoundsForRegion(initialBin.regionObj, bins);

          var firstBin = binBounds[0];
          var lastBin = binBounds[1];
          var lastStart = lastBin.start + lastBin.regionObj.start;
          var firstStart = firstBin.start + firstBin.regionObj.start;

          var firstBox = $gd.D3svg().select($gd.region('chart')).selectAll('[data-start="' + firstStart + '"]')[0][0].getBBox();

          var lastBox = $gd.D3svg().select($gd.region('chart')).selectAll('[data-start="' + lastStart + '"]')[0][0].getBBox();

          $gd.dragBox.attr('x', firstBox.x);
          $gd.dragBox.attr('width', lastBox.x + lastBox.width - firstBox.x);

          if ($gd.options.endSelectionCallback) {
            $gd.options.endSelectionCallback.call($gd, {start: firstBin, end: lastBin});
          }

        }
        else {
          $gd.singleClick = true;
          $gd.doubleClick = false;

          setTimeout(function () {
            if ($gd.singleClick) {
              $gd.singleClick = false;
            }
          }, 250);

          initialBox = this.getBBox();
          initialBin = d;

          $gd.dragBox.attr('x', initialBox.x)
          $gd.dragBox.attr('width', initialBox.width);
          $gd.showSelection();

          dragRange = [d.start + d.regionObj.start, d.end + d.regionObj.start];
          if ($gd.options.startSelectionCallback) {
            $gd.options.startSelectionCallback.call($gd);
          }
        }

      })
      .on('mouseenter', function (d) {
        if ($gd.dragging) {

          var box = this.getBBox();

          if (d.regionObj !== initialBin.regionObj) {

            var binBounds = $gd.binBoundsForRegion(initialBin.regionObj, bins);
            var firstBin = binBounds[0];
            var lastBin = binBounds[1];

            if (box.x <= initialBox.x) {
              d = firstBin;
            }
            else if (box.x > initialBox.x) {
              d = lastBin;
            }

            var pos = d.start + d.regionObj.start;
            var node = $gd.D3svg().select($gd.region('chart')).selectAll('[data-start="' + pos + '"]');

            if (node) {
              box = node[0][0].getBBox();
            }

          }

          if (box.x <= initialBox.x) {
            dragRange[0] = d.start + d.regionObj.start;
            dragRange[1] = initialBin.end + initialBin.regionObj.start;
          }
          if (box.x >= initialBox.x) {
            dragRange[0] = initialBin.start + initialBin.regionObj.start;
            dragRange[1] = d.end + d.regionObj.start;
          }

          var selectedBins = $gd.binsInRange(bins, dragRange[0], dragRange[1]);
          var lastBin = selectedBins[selectedBins.length - 1];
          var lastStart = lastBin.start + lastBin.regionObj.start;
          var firstStart = selectedBins[0].start + selectedBins[0].regionObj.start;

          var firstBox = $gd.D3svg().select($gd.region('chart')).selectAll('[data-start="' + firstStart + '"]')[0][0].getBBox();
          var lastBox = $gd.D3svg().select($gd.region('chart')).selectAll('[data-start="' + lastStart + '"]')[0][0].getBBox();

          $gd.dragBox.attr('x', firstBox.x);
          $gd.dragBox.attr('width', lastBox.x + lastBox.width - firstBox.x);

          $gd.showSelection();

          var score = 0;
          selectedBins.forEach(
            function (bin, idx) {
              if (bin.results) {
                score += bin.results.count;
              }
            }
          )

          var units = (score > 1) ? ' genes' : ' gene';
          $gd.showToolTip({label: d.regionObj.name + ':' + (dragRange[0] - d.regionObj.start) + '-' + (dragRange[1] - d.regionObj.start) + ' ' + score + units})

        }
        else {
          //we need to do this to ensure that the callback fires, since we are re-highlighting
          $gd.showHighlightBox();
          //but we don't actually want to show the box if we're dragging, so we duck internally to this.
          if (initialBin != undefined) {
            $gd.highlightBox.attr('visibility', 'hidden');
          }
        }

      })

      .call(function (d) { return mouseAction.call(this, d) })
      .call(drag)
    ;

    binSelection
      .transition()
      .duration(transitionTime)
      .attr('opacity', function (d) { return (d.results && d.results.count) || d.regionObj.name == 'UNANCHORED' ? 1 : 0})
      .attr('x', function (d) { return Math.round(scale(d.start + d.regionObj.start)) })
      .attr('width', function (d) { return Math.round(scale((d.end - d.start))) })
      .attr('data-start', function (d) { return d.start + d.regionObj.start})
      .attr('data-end', function (d) { return d.end + d.regionObj.start})
      .attr('fill', function (d, i) {

        if (d.regionObj.name == 'UNANCHORED') {
          return $gd.options.unachoredBinColor;
        }

        var colorScale = d3.scale.linear().domain([0, 1]).range(['#FFFFFF', $gd.colorForRegion(d.regionObj)])
        var scale = d3.scale.linear().domain([0, 1]).range([colorScale(.5), $gd.colorForRegion(d.regionObj)]);
        if (!d.results || d.results.count === 0) {
          return colorScale(.25);
        }
        else {
          return scale(d.results.count / maxBinScore);
        }
      });

    binSelection
      .exit()
      .transition()
      .duration(transitionTime)
      .attr('opacity', 0)
      .attr('x', bounds.size.width + 1)
      .attr('width', 0)
      .each('end', function (d) { d3.select(this).remove() });

    $gd.dragBox = this.D3svg().select(this.region('chart')).selectAll('.dragBox').data([0]);

    $gd.dragBox
      .enter()
      .append('rect')
      .attr('class', 'dragBox')
      .attr('visibility', 'hidden')
      .attr('height', $gd.options.binHeight || bounds.size.height)
      .attr('width', 0)
      .attr('x', 0)
      .attr('y', 0)
      .attr('fill', $gd.options.dragColor)
      .attr('stroke', $gd.options.dragStrokeColor)
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6)
      .attr('fill-opacity', 0.6)
      .attr('pointer-events', 'none')
    ;

    $gd.highlightBox = this.D3svg().select(this.region('chart')).selectAll('.highlightBox').data([0]);

    $gd.highlightBox
      .enter()
      .append('rect')
      .attr('class', 'highlightBox')
      .attr('visibility', 'hidden')
      .attr('height', $gd.options.binHeight || bounds.size.height)
      .attr('width', bounds.size.width)
      .attr('x', 0)
      .attr('y', 0)
      .attr('stroke', $gd.options.highlightColor)
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('pointer-events', 'none')
    ;

    this.initialized = true;


  },

  colorForRegion: function (regionObj) {

    /*var regionIdx = parseInt(regionObj.name);

     return regionIdx % 2
     ? '#557B74'
     : '#f0b866';*/


    var region = regionObj.name;

    var map = this.regionColors;
    if (map == undefined) {
      map = this.regionColors = {colorScale: this.options.colorScale()};
    }

    if (map[region] == undefined) {
      map[region] = map.colorScale(d3.keys(map).length);
    }

    return map[region];

  }


});

