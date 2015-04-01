var Polygon = function(points) {
	if (points === undefined) {
		this.points = [];
	} else {
		this.points = points;
	}
};
Polygon.fromWKT = function(wkt) {
	var points = wkt.split('POLYGON ((')[1].split('))')[0].split(', ');
	points.pop();
	for (var i = 0; i < points.length; i++) {
		var point = points[i].split(' ');
		points[i] = new Point(parseFloat(point[0]), parseFloat(point[1]));
	}
	return new Polygon(points);
};
Polygon.prototype.bounds = function() {
	return new Bounds(this.points);
};
Polygon.prototype.toString = function() {
	var points = [];
	for (var point of this.points) {
		points.push(point.toString());
	}
	return '[' + points.join(',') + ']';
};
Polygon.prototype.toFixed = function(digits) {
	var points = [];
	for (var point of this.points) {
		points.push(point.toFixed(digits));
	}
	return '[' + points.join(',') + ']';
};