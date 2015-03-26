var Point = function(x, y) {
	this.x = x;
	this.y = y;
};
Point.prototype.toString = function() {
	return '[' + [this.x, this.y].join(',') + ']';
};
Point.prototype.toFixed = function(digits) {
	return '[' + [this.x.toFixed(digits), this.y.toFixed(digits)].join(',') + ']';
};