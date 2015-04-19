var BBOX = function() {
	switch (arguments.length) {
		case 1:
			var bbox = arguments[0];
			this.min = new Point(bbox[0], bbox[1]);
			this.max = new Point(bbox[2], bbox[3]);
			break;
		case 2:
			this.min = arguments[0];
			this.max = arguments[1];
			break;
	}
};
BBOX.prototype.width = function() {
	return this.max.x - this.min.x;
};
BBOX.prototype.height = function() {
	return this.max.y - this.min.y;
};