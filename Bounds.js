var Bounds = function(points) {
	this.min = new Point(Infinity, Infinity);
	this.max = new Point(-Infinity, -Infinity);
	this.addPoints(points);
};
Bounds.prototype.addPoint = function(point) {
	this.min = new Point(Math.min(point.x, this.min.x), Math.min(point.y, this.min.y));
	this.max = new Point(Math.max(point.x, this.max.x), Math.max(point.y, this.max.y));
};
Bounds.prototype.addPoints = function(points) {
	for (var point of points) {
		this.addPoint(point);
	}
};
Bounds.prototype.round = function() {
	this.min = new Point(Math.floor(this.min.x), Math.floor(this.min.y));
	this.max = new Point(Math.ceil(this.max.x), Math.ceil(this.max.y));
};
Bounds.prototype.width = function() {
	return this.max.x - this.min.x;
};
Bounds.prototype.height = function() {
	return this.max.y - this.min.y;
};
Bounds.prototype.expand = function(range) {
	this.min = new Point(this.min.x - range, this.min.y - range);
	this.max = new Point(this.max.x + range, this.max.y + range);
};