/*

*/

var $ = require('jquery');

var jqElem = require('./jqElem');
var KBWidget = require('./kbwidget');
var KbaseTreechart = require('./kbaseTreechart.js');
var GeneDistribution = require('./GeneDistribution.js');

module.exports = KBWidget({
	    name: "WareTreeGeneDistribution",

        version: "1.0.0",
        options: {},

        setDataset : function(dataset) {

            var newset = dataset;

            if (this.$tree.lastClicked != undefined) {

                var $tree = this.$tree;

                //gotta layout the tree first.
                $tree.treeLayout.nodes(dataset).reverse();

                $tree.originalRoot = dataset;

                var clickID = $tree.uniqueness($tree.lastClicked);

                if (clickID) {

                    var scanner = function(d) {
                        if ($tree.uniqueness(d) == clickID) {
                            newset = d;
                            return;
                        }
                        else {
                            if (d.children) {
                                d.children.forEach(
                                    function(d) {
                                        scanner(d);
                                    }
                                )
                            }

                            if (d._children) {
                                d._children.forEach(
                                    function(d) {
                                        scanner(d);
                                    }
                                )
                            }

                        }
                    }

                    scanner(dataset);
                }

                this.relayout(newset);
                newset.stroke = 'cyan';
            }

            this.$tree.setDataset(newset);
        },


        highlightTree : function(d, node, $lgv, $tree) {
            d3.select(node).selectAll('.nodeText')
                .attr('fill', $lgv.options.highlightColor)
                .attr('font-style', 'italic')
            ;

            var nodes = d.id.split('/');

            while (nodes.length) {
                var nodeID = nodes.join('/');

                $tree.data('D3svg').select($tree.region('chart')).selectAll('[data-link-id="' + nodeID + '"]')
                        .attr('stroke', $lgv.options.highlightColor)

                nodes.pop();
            }
        },

        dehighlightTree : function($tree) {
            $tree.data('D3svg').select($tree.region('chart')).selectAll('.nodeText')
                .attr('fill', 'black')
                .attr('font-style', '')
            ;

            $tree.data('D3svg').select($tree.region('chart')).selectAll('.link')
                    .attr('stroke', $tree.options.lineStroke)

        },

        relayout : function(d) {

            var $wtgd = this;

            delete d.depth;
            //delete d.id;
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
                        $wtgd.relayout(kid);
                    }
                )
            }

            if (d._children) {
                $.each(
                    d._children,
                    function (idx, kid) {
                        $wtgd.relayout(kid);
                    }
                )
            }

            return d;
        },

        init : function(options) {

            this._super(options);



            var $wtgd = this;

            this.$tree = KbaseTreechart.bind(this.$elem)(
                {

                    nodeEnterCallback : function(d, i, node, duration) {

                        if (1 || d.model.genome) {
                            var $tree = this;

                            var bounds = this.chartBounds();

                            var y = $tree.options.fixed && (! d.children || d.length == 0)
                                ? $tree.options.fixedDepth
                                : d.y;

                            var labelDelta = 50;

                            var width = bounds.size.width - y - this.options.labelWidth - this.options.labelSpace - labelDelta;

                            d.lgvID = 'lgv-' + $tree.uuid();

                            var lgvSelection = d3.select(node).selectAll(d.lgvID).data([d]);
                            var nodeHeight = 0.7 * node.getBBox().height;

                            if ($tree.options.lgvTransform == undefined) {
                                $tree.options.lgvTransform =
                                    'translate(' + ($tree.options.labelWidth + labelDelta + 3) + ',' + (0 - nodeHeight / 2) + ') , ' +
                                    'scale(' + width / bounds.size.width + ',1)' //+ nodeHeight / $tree.$elem.height() + ')';
                                $tree.options.lgvHeight = nodeHeight;
                            }


                            lgvSelection
                                .enter()
                                    .append('g')
                                        .attr('class', d.lgvID)
                                        .attr('transform', $tree.options.lgvTransform)
                            lgvSelection
                              .enter()
                                .append('text')
                                    .attr('class', 'scoreField')
                                    .attr('style', 'font-size : 11px;cursor : pointer;-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;')
                                    .attr("dy", ".35em")
                                    .attr('dx', $tree.options.labelWidth + labelDelta)
                                    .attr('text-anchor','end')
                            ;

                            if (d.model.genome) {
                                d.$lgv = GeneDistribution.bind(jqElem('div'))(
                                    {
                                        scaleAxes   : true,
                                        customRegions : {
                                            chart : d.lgvID
                                        },
                                        parent : $tree,
                                        binHeight : $tree.options.lgvHeight,
                                        endSelectionCallback : function() {
                                            if ($wtgd.options.geneSelection) {
                                                $wtgd.options.geneSelection.apply(this, arguments)
                                            }
                                            $wtgd.lastSelection = {$lgv : this, d : d, node : node};
                                        },
                                        cancelSelectionCallback : function() {
                                            if ($wtgd.lastSelection != undefined) {
                                                $wtgd.lastSelection.$lgv.showSelection();
                                            }
                                        },
                                        startSelectionCallback : function() {
                                            if ($wtgd.lastSelection != undefined && $wtgd.lastSelection.$lgv !== this) {
                                                $wtgd.lastSelection.$lgv.hideSelection();
                                            }
                                        },

                                        showHighlightCallback : function() {

                                            if ($wtgd.lastSelection) {
                                                $wtgd.dehighlightTree($tree);
                                            }

                                            $wtgd.highlightTree(d, node, this, $tree);
                                        },

                                        hideHighlightCallback : function() {

                                            $wtgd.dehighlightTree($tree);

                                            if ($wtgd.lastSelection) {
                                                $wtgd.highlightTree($wtgd.lastSelection.d, $wtgd.lastSelection.node, $wtgd.lastSelection.$lgv, $tree);
                                            }


                                        },
                                    }
                                );
                            }

                        }
                    },

                    nodeUpdateCallback : function(d,i,node, duration) {

                        d3.select(node).selectAll(d.lgvID).data([d]).transition().duration(duration).attr('opacity', 1);

                        var scoreFieldSelection = d3.select(node).selectAll('.scoreField').data([d]);

                        if (d.lgvID && d.$lgv || d._children) {
                            scoreFieldSelection.text(d.results().count);
                        }
                        else {
                            scoreFieldSelection.text('');
                        }

                        if (d.lgvID && d.$lgv) {
                            d.$lgv.options.customRegions.chart = d.lgvID;
                            d.$lgv.setDataset(d.model.genome);

                        }
                    },

                    nodeExitCallback : function(d,i,node, duration) {
                        //if (! d.children || ! d.children.length) {
                        if (d.lgvID) {
                            d3.select(node).selectAll(d.lgvID).data([d]).exit().transition().duration(duration).attr('opacity', 0).remove();
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
                    nodeHeight      : 12,
                    staticWidth     : true,
                    rootDepth       : 5,

                    depth : function(d, rootOffset, chartOffset) {
                        if (d.parent == undefined) {
                            return this.options.rootDepth;
                        }
                        else {
                            return this.defaultDepth(d, rootOffset, chartOffset);
                        }
                    },

                    strokeWidth : function(d) {

                        var node = d.target,
                            maxScore = node.globalResultSetStats().maxProportion,
                            maxRange = maxScore === 1 ? 2 : 5,
                            targetScore = node.results().proportion;

                        var scale = d3.scale.linear()
                          .domain([0, maxScore])
                          .range([.5, maxRange]);


                        return scale(targetScore);
                    },

                    nameFunction    : function (d) {
                      return d.model.name;
                    },

                    truncationFunction : function(d, elem, $tree) {
                        d3.select(elem)
                        .on('mouseover.truncated', function(d) {
                            $tree.showToolTip({label : d.name});
                        })
                        .on('mouseout.truncated', function(d) {
                            $tree.hideToolTip();
                        });
                        return d.name_truncated + '...';
                    },

                    nodeOver : function(d, node) {
                        this.options.tooltip.call(this, d);
                        this.options.textOver.call(this, d, node);
                    },

                    nodeOut : function (d, node) {
                        this.hideToolTip();
                        this.options.textOut.call(this, d, node);
                    },

                    textOver : function (d, node) {
                        //this has an -awful- hack and hardwires the highlight color to red.
                        $wtgd.highlightTree(d, node.parentNode, { options : { highlightColor : 'red'} }, this);
                    },

                    textOut : function(d, node) {
                        $wtgd.dehighlightTree(this);
                    },



                    nodeClick : function(d, node) {
                        //this.options.collapseTree.call(this,d,node);
                        this.options.rerootTree.call(this, d, node);
                    },

                    textClick : function(d, node) {
                        //this.options.collapseTree.call(this,d,node);
                        this.options.rerootTree.call(this, d, node);
                    },

                    nodeDblClick : function(d, node) {
                        //this.options.rerootTree.call(this, d, node);
                        this.options.collapseTree.call(this, d, node);
                    },

                    textDblClick : function(d, node) {
                        //this.options.rerootTree.call(this, d, node);
                        this.options.collapseTree.call(this, d, node);
                    },

                    collapseTree : function(d, node) {

                        var oldState = this.nodeState(d);

                        this.defaultNodeClick(d,node);

                        var newState = this.nodeState(d);

                        if (oldState == 'closed' && newState == 'open' && $wtgd.options.subtreeExpand) {
                            $wtgd.options.subtreeExpand.call(this, d);
                        }
                        if (oldState == 'open' && newState == 'closed' && $wtgd.options.subtreeCollapse) {
                            $wtgd.options.subtreeCollapse.call(this, d);
                        }

                        if ($wtgd.options.taxonClick != undefined) {
                            $wtgd.options.taxonClick.call(this, d);
                        }

                    },

                    rerootTree : function(d, node) {

                        //clicks on the root node shouldn't do anything, so bail out.
                        if (d.name == 'Eukaryota') {
                            return;
                        }

                        var isRoot = true;
                        var lastRoot = undefined;

                        var parent = d;
                        if (this.originalRoot == undefined || this.lastClicked !== d) {
                            if (this.originalRoot == undefined) {
                                this.originalRoot = this.options.dataset;
                            }

                            this.lastClicked = d;
                            lastRoot = this.originalRoot;

                            var distance = 0;
                            while (parent.name != 'Eukaryota') {
                                distance++;
                                parent = parent.parent;
                            }
                            this.options.rootDepth = 5 + this.options.distance * distance;//*/

                        }
                        else {
                            lastRoot = d;
                            d = this.originalRoot;
                            this.originalRoot = undefined;
                            this.lastClicked = undefined;
                            isRoot = false;
                            this.options.rootDepth = 5;
                        }

                        //if (this.nodeState(d) == 'open') {
                            $wtgd.relayout(d);
                            d.stroke = this.originalRoot ? 'cyan' : 'darkslateblue';

                            this.setDataset(d);

                            if ($wtgd.options.taxonDblClick != undefined) {
                                $wtgd.options.taxonDblClick.call(this, d, isRoot);
                            }

                            if ($wtgd.options.treeRootChange) {
                                $wtgd.options.treeRootChange.call(this, d, lastRoot);
                            }

                        //}


                    },

                }
            )

            return this;
        },


    });
