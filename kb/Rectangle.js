'use strict';

var Point = require('./Point.js');
var Size = require('./Size.js');

var Rectangle = function(origin,size) {
    if (origin == undefined) {
        origin = new Point(-1,-1);
    }
    if (size == undefined) {
        size = new Size(-1,-1);
    }
    this.origin = origin;
    this.size = size;
};

Rectangle.prototype.invert = function() {
    return new Rectangle(
        this.height,
        this.width
    );
};

Rectangle.prototype.lowerRight = function() {
    return new Point(
        this.origin.x + this.size.width,
        this.origin.y + this.size.height
    )
};

Rectangle.prototype.insetRect = function(dx,dy) {
    return new Rectangle(
        new Point(this.origin.x + dx / 2, this.origin.y + dy / 2),
        new Size(this.size.width - dx, this.size.height - dy)
    );
};

Rectangle.prototype.fromString = function (string) {
    var results;
    if (results = string.match(/{{(.+),\s*(.+)},\s*{(.+),\s*(.+)}}/)) {
        return new Rectangle(
            new Point(parseInt(results[1]), parseInt(results[2])),
            new Size(parseInt(results[3]), parseInt(results[4])));
    }
    else {
        return undefined;
    }
};

Rectangle.prototype.intersects = function (r2) {
    return this.origin.x < r2.origin.x + r2.size.width
        && this.origin.x + this.size.width > r2.origin.x
        && this.origin.y < r2.origin.y + r2.size.height
        && this.origin.y + this.size.height > r2.origin.y;
};

Rectangle.prototype.unionRect = function (r2, padding) {

    var union = new Rectangle();

    var myLL = this.lowerRight();
    var r2LL = r2.lowerRight();

    union.origin.x = Math.min(this.origin.x, r2.origin.x);
    union.origin.y = Math.min(this.origin.y, r2.origin.y);

    var rightX = Math.max(myLL.x, r2LL.x);
    var rightY = Math.max(myLL.y, r2LL.y);

    union.size.width = union.origin.x + rightX;
    union.size.height = union.origin.Y + rightY;

    if (padding != undefined) {
        union.origin.x -= padding;
        union.origin.y -= padding;
        union.size.width += padding * 2;
        union.size.height += padding * 2;
    }

    return union;

};

Rectangle.prototype.isValidRect = function() {
    return !(isNaN(this.origin.x)
        || isNaN(this.origin.y)
        || isNaN(this.size.width)
        || isNaN(this.size.height) )
};

Rectangle.prototype.intersectRect = function(r2) {

    var intersect = new Rectangle();

    var myLL = this.lowerRight();
    var r2LL = r2.lowerRight();

    intersect.origin.x = Math.max(this.origin.x, r2.origin.x);
    intersect.origin.y = Math.max(this.origin.y, r2.origin.y);

    var rightX = Math.min(myLL.x, r2LL.x);
    var rightY = Math.min(myLL.y, r2LL.y);

    intersect.size.width = rightX - intersect.origin.x;
    intersect.size.height = rightY - intersect.origin.y;

    if (intersect.size.width <= 0) {
        intersect.size.width = Number.NaN;
    }

    if (intersect.size.height <= 0) {
        intersect.size.height = Number.NaN;
    }

    return intersect;

};

Rectangle.prototype.containsPoint = function (p) {
    var ux = this.origin.x + this.size.width;
    var uy = this.origin.y + this.size.height;
    return p.x >= this.origin.x && p.x <= ux
        && p.y >= this.origin.y && p.y <= uy;
};

Rectangle.prototype.equals = function (r2) {
    if (this == undefined || r2 == undefined) {
        return false;
    }
    else {
        return this.origin.x == r2.origin.x
            && this.origin.y == r2.origin.y
            && this.size.width == r2.size.width
            && this.size.height == r2.size.height;
    }
};

Rectangle.prototype.asString = function () {
    return "{" + this.origin.asString() + ", " + this.size.asString() + "}";
};

module.exports = Rectangle;
