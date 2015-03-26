CanvasRenderingContext2D.prototype.drawPolygon = function(polygon, holes) {
	this.beginPath();
	var point = polygon[0];
	this.moveTo(point[0], point[1]);
	//this.moveTo(0, 0);
	for (var i = 1; i < polygon.length; i++) {
		point = polygon[i];
		this.lineTo(point[0], point[1]);
	}
	/*this.lineTo(gebouw.width, 0);
	this.lineTo(gebouw.width, gebouw.height);
	this.lineTo(0, gebouw.height);*/
	point = polygon[0];
	this.lineTo(point[0], point[1]);
	//this.lineTo(0, 0);
	this.closePath();
	for (var i = 0; i < holes.length; i++) {
		var hole = holes[i];
		point = hole[hole.length - 1];
		this.moveTo(point[0], point[1]);
		for (var j = 0; j < hole.length; j++) {
			point = hole[j];
			this.lineTo(point[0], point[1]);
		}
	}
	this.closePath();
	this.fillStyle = '#ffffff';
	this.fill();
};