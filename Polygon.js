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
Polygon.fromCanvas = function(canvas, bbox, width, height, offset) {
	var polygon = new Polygon();
	var result = MarchingSquares.getBlobOutlinePoints(canvas);
	if (result.length > 0) {
		var theBorder = [];
		for (var borderIndex = 0; borderIndex < result.length / 2; borderIndex++) {
			var borderPoint = {
				x: result[borderIndex * 2],
				y: result[borderIndex * 2 + 1]
			};
			theBorder.push(borderPoint);
		}
		var corners = simplify(theBorder, 2, true);
	  var corner = null;
		var left = parseInt(bbox[0]);
		var right = parseInt(bbox[2]);
		var top = parseInt(bbox[1]);
		var bottom = parseInt(bbox[3]);
	  for (var k = 0; k < corners.length; k++) {
	    corner = corners[k];
	    var x = (left + ((corner.x + offset.x) / width) * (right - left));
			var y = (bottom - ((corner.y + offset.y) / height) * (bottom - top));
	    //polygon.push('[' + xPos.toFixed(2) + ',' + yPos.toFixed(2) + ']');
	    polygon.points.push(new Point(x, y));
	  }
	  //console.log(thePolygon.toFixed(2));
	  //console.log(polygon.join(','));
	  //$R.polygonsBaan.push("addComplexBaan(" + wegbaan.id + ", '" + (wegbaan.type + 'Baan') + "', [" + polygon.join(',') + "]);");
	}
	return polygon;
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