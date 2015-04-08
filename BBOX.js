var BBOX = function() {
	var bbox;
	if (arguments.length === 1) {
		bbox = arguments[0];
	}
	this.min = new Point(bbox[0], bbox[1]);
	this.max = new Point(bbox[2], bbox[3]);
};
BBOX.prototype.width = function() {
	return this.max.x - this.min.x;
};
BBOX.prototype.height = function() {
	return this.max.y - this.min.y;
};