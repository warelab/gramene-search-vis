var $ = require('jquery');

module.exports = function jqElem(tagName) {
  var tag = "<" + tagName + ">";
  if (!tag.match(/^(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track)/)) {
    tag += '</' + tagName + '>';
  }
  return $(tag);
};