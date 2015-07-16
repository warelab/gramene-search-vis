var $ = require('jquery');
var KBWidget = require('./kbaseVisWidget.js');
var d3 = require('d3');

module.exports = KBWidget({

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
    regionSaturation : 0.25,
    unachoredBinColor : 'lightgray',
    dragColor : 'red',
    highlightColor : 'red',

    tooltipLeftOffset : 10,
    tooltipTopOffset : -15,

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

    showHighlightBox : function() {
    this.highlightBox.attr('visibility', 'visible');

    if (this.options.showHighlightCallback) {
        this.options.showHighlightCallback.call(this);
    }

    },

    hideHighlightBox : function() {
    this.highlightBox.attr('visibility', 'hidden');

    if (this.options.hideHighlightCallback) {
        this.options.hideHighlightCallback.call(this);
    }
    },

    binsInRange : function(bins, start, end) {
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
            score = b.results ? b.results.count : 0;
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
        var colorScale = d3.scale.linear().domain([0, 1]).range(['#FFFFFF', $gd.colorForRegion(d.name)])
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
        .on('dragstart', function(d) {
            $gd.dragging = true;
            $gd.validDrag = true;
            //$gd.hideHighlightBox();
            $gd.highlightBox.attr('visibility', 'hidden');
        })
        .on('drag', function(d) {
            var coordinates = [0, 0];
            coordinates = d3.mouse(this);
            var bounds = this.getBBox();

            if (coordinates[1] < 0 || coordinates[1] > bounds.height) {
                $gd.dragBox.attr('visibility', 'hidden');
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
        .on('dragend', function(d) {
            $gd.dragging = false;
            dragRegion = undefined;

            var binX = parseFloat($gd.dragBox.attr('x'));
            var binEnd = parseFloat($gd.dragBox.attr('width')) + binX;

            if ($gd.validDrag) {

                var selectedBins = $gd.binsInRange(bins, dragRange[0], dragRange[1]);

                if (selectedBins.length) {

                    if ($gd.options.selectionCallback) {
                        $gd.options.selectionCallback.call(this, {start : selectedBins[0], end : selectedBins[selectedBins.length - 1]});
                    }

                }

            }

//            $gd.dragBox.attr('visibility', 'hidden');
            dragRange = [];
        })

    var binSelection = binsSelection.selectAll('.bin').data(bins);

    var initialBox = undefined;
    var dragRange = [];
    var dragRegion = undefined;

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
                initialBox = this.getBBox();
                dragRegion = d.regionObj;
                $gd.dragBox.attr('x', initialBox.x)
                $gd.dragBox.attr('width', initialBox.width);
                $gd.dragBox.attr('visibility', 'visible');

                dragRange = [d.start + d.regionObj.start, d.end + d.regionObj.start];
            })
            .on('mouseenter', function(d) {
            if ($gd.dragging) {

                var box = this.getBBox();

                if (d.regionObj !== dragRegion) {

                    var firstBin = undefined;
                    var lastBin = undefined;
                    var foundRegion = false;

                    for (var i = 0; i < bins.length; i++) {
                        var bin = bins[i];

                        if (bin.regionObj === dragRegion && firstBin == undefined) {
                            firstBin = bin;
                            foundRegion = true;
                            continue;
                        }

                        if (foundRegion && bin.regionObj !== dragRegion) {
                            break;
                        }

                        lastBin = bin;

                    }

                    if (box.x <= initialBox.x) {
                        d = firstBin;
                    }
                    else if (box.x > initialBox.x) {
                        d = lastBin;
                    }

                    var pos = d.start + d.regionObj.start;
                    var node = d3.select('[data-start="' + pos + '"]');

                    if (node) {
                        box = node[0][0].getBBox();
                    }

                }

                var binX = parseFloat($gd.dragBox.attr('x'));
                var binEnd = parseFloat($gd.dragBox.attr('width')) + binX;

                if (box.x <= initialBox.x) {
                    binX = box.x
                    dragRange[0] = d.start + d.regionObj.start;
                }
                if (box.x >= initialBox.x) {
                    binEnd = box.x + box.width;
                    dragRange[1] = d.end + d.regionObj.start;
                }

                $gd.dragBox.attr('x', binX);

                var binWidth = binEnd - binX;

                $gd.dragBox.attr('width', binWidth);
                $gd.dragBox.attr('visibility', 'visible');

                var selectedBins = $gd.binsInRange(bins, dragRange[0], dragRange[1]);
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
                if (dragRegion != undefined) {
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

        var colorScale = d3.scale.linear().domain([0, 1]).range(['#FFFFFF', $gd.colorForRegion(d.region)])
        var scale = d3.scale.linear().domain([0, 1]).range([colorScale(.5), $gd.colorForRegion(d.region)]);
        if (!d.results || d.results.count === 0) {
            return colorScale(.25);
        }
        else {
            return scale( d.results.count / maxBinScore );
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

    colorForRegion: function (region, colorScale) {
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

