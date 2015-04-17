var d3 = require('d3');
var taxonomyGetter = require('gramene-taxonomy-with-genomes');

var height = 2000, width = 960;

var tree = d3.layout.tree()
  .size([height, width - 160])
  .separation(function (a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

var diagonal = d3.svg.diagonal()
  .projection(function (d) { return [d.y, d.x]; });

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g");

taxonomyGetter.get().then(function (taxonomy) {
  var nodes = tree.nodes(taxonomy),
    links = tree.links(nodes);

  var link = svg.selectAll(".link")
    .data(links)
    .enter().append("path")
    .attr("class", "link")
    .attr("d", diagonal);

  var node = svg.selectAll(".node")
    .data(nodes)
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", function (d) { return "translate(" + d.y + ", " + d.x + ")"; });

  node.append("circle")
    .attr("r", 4.5);

  node.append("text")
    .attr("dy", ".31em")
    .attr("dx", ".6em")
    .attr("text-anchor", "start")
    .text(function (d) { return d.model.name; });
});

d3.select(self.frameElement).style("height", height + "px");