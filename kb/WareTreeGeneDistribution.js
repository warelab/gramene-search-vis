/*

*/

var $ = require('jquery');

var jqElem = require('./jqElem');
var KBWidget = require('./kbwidget');
var KbaseTreechart = require('./kbaseTreechart.js');
var GeneDistribution = require('./GeneDistribution.js');

var calculateScore = function(node) {

    if (node.score == undefined) {
        var score = 0;

        if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
                score += calculateScore(node.children[i]);
            }
        }

        if (node._children) {
            for (var i = 0; i < node._children.length; i++) {
                score += calculateScore(node._children[i]);
            }
        }

        if (node.model.genome) {
            node.model.genome.eachRegion(function(region) {
                region.eachBin(function(bin) {
                    score += bin.results ? bin.results.count : 0;
                })
            })
        }

        node.score = score;
    }

    return node.score;
}


module.exports = KBWidget({
	    name: "WareTreeGeneDistribution",

        version: "1.0.0",
        options: {},

        init : function(options) {

            this._super(options);

            var relayout = function(d) {

                delete d.depth;
                delete d.id;
                delete d.x;
                delete d.x0;
                delete d.y;
                delete d.y0;
                delete d.parent;
                delete d.stroke;

                if (d.children) {
                    $.each(
                        d.children,
                        function (idx, kid) {
                            relayout(kid);
                        }
                    )
                }

                return d;
            }

            KbaseTreechart.bind(this.$elem)(
                {

                    nodeEnterCallback : function(d, i, node, duration) {
                        if (d.model.genome) {
                            var $tree = this;

                            var bounds = this.chartBounds();

                            var y = $tree.options.fixed && (! d.children || d.length == 0)
                                ? $tree.options.fixedDepth
                                : d.y;

                            var width = bounds.size.width - y - this.options.labelWidth - this.options.labelSpace;

                            var labelDelta = 50;


                            var lgvSelection = d3.select(node).selectAll('.lgv').data([d]);

                            var lgvID = 'lgv-' + $tree.uuid();
                            var nodeHeight = 0.7 * node.getBBox().height;

                            if ($tree.options.lgvTransform == undefined) {
                                $tree.options.lgvTransform =
                                    'translate(' + ($tree.options.labelWidth + labelDelta + 3) + ',' + (0 - nodeHeight / 2) + ') , ' +
                                    'scale(' + width / bounds.size.width + ',' + nodeHeight / $tree.$elem.height() + ')'
                            }


                            lgvSelection
                                .enter()
                                    .append('g')
                                        .attr('class', lgvID)
                                        .attr('transform', $tree.options.lgvTransform)
                            lgvSelection
                              .enter()
                                .append('text')
                                    .attr('style', 'font-size : 11px;cursor : pointer;-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;')
                                    .attr("dy", ".35em")
                                    .attr('dx', $tree.options.labelWidth + labelDelta)
                                    .attr('text-anchor','end')
                                    .text(d.model.genome.results.count)
                            ;

                            if (d.$lgv == undefined) {
                                d.$lgv = GeneDistribution.bind(jqElem('div'))(
                                    {
                                        scaleAxes   : true,
                                        customRegions : {
                                            chart : lgvID
                                        },
                                        parent : $tree,
                                    }
                                );
                            }

                            d.$lgv.options.customRegions.chart = lgvID;
                            d.$lgv.setDataset(d.model.genome);

                        }
                    },

                    nodeUpdateCallback : function(d,i,node, duration) {
                        if (! d.children || ! d.children.length) {
                            d3.select(node).selectAll('.lgv').data([d]).transition().duration(duration).attr('opacity', 1);
                        }
                    },

                    nodeExitCallback : function(d,i,node, duration) {
                        if (! d.children || ! d.children.length) {
                            d3.select(node).selectAll('.lgv').data([d]).exit().transition().duration(duration).attr('opacity', 0);
                        }
                    },


                    dataset         : this.options.dataset,
                    displayStyle    : 'Nnt',
                    circleRadius    : 2.5,
                    lineStyle       : 'square',
                    layout          : d3.layout.cluster().separation(function(a,b){return 1}),
                    distance        : 10,
                    fixed           : true,
                    labelWidth      : 100,
                    nodeHeight      : 7,

                    strokeWidth : function(d) {

                        var parent = d.source;

                        while (parent.parent != undefined && (this.filterParent == undefined || parent.parent != this.filterParent[0])) {
                            parent = parent.parent;
                        }

                        var rootScore = calculateScore(parent);

                        var targetScore = calculateScore(d.target);

                        var scale = d3.scale.linear()
                            .domain([0, rootScore])
                            .range([.5, 5]);

                        return scale(targetScore);
                    },

                    nameFunction    : function (d) {
                      return d.model.name;
                    },

                    truncationFunction : function(d, elem, $tree) {
                        d3.select(elem)
                        .on('mouseover', function(d) {
                            $tree.showToolTip({label : d.name});
                        })
                        .on('mouseout', function(d) {
                            $tree.hideToolTip();
                        });
                        return d.name_truncated + '...';
                    },

                    nodeDblClick : function(d) {
                        this.options.textDblClick.call(this, d);
                    },

                    textClick : function(d) {

                    },

                    textDblClick : function(d) {
                        var parent;
                        if (this.filterParent == undefined) {
                            this.filterParent = [];
                        }

                        if (! d.parent && this.filterParent.length) {
                            d = this.filterParent.pop();
                            delete d.stroke;
                        }
                        else {
                            var parent = d.parent;
                            while (parent != undefined && parent.parent != undefined) {
                                this.filterParent.unshift(parent);
                                parent = parent.parent;
                            }
                        }

                        if (d.children && d.children.length) {
                            relayout(d);
                            console.log("WTF ? ", d);
                            d.stroke = this.filterParent.length ? 'cyan' : 'darkslateblue';
                            this.setDataset(d);
                        }

                    },

                    tooltip : function(d) {

                        if (d.children || d._children) {

                            if (d.score == undefined) {
                                d.score = calculateScore(d);
                            }

                            this.showToolTip({label : d.name + ' - ' + d.score + ' genes'})
                        }

                    },
                }
            )

            return this;
        },


    });
