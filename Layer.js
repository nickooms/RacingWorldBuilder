var Layer = function(parameters) {
	this.id = parameters.id;
	this.border = parameters.border || '1px solid #000000';
	this.layerName = parameters.layerName;
	this.min = parameters.min;
	this.max = parameters.max;
	var imageData = parameters.imageData;
	this.width = imageData.width;
	this.height = imageData.height;
	this.canvas = document.createElement('canvas');
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	this.canvas.style.border = this.border;
	this.context = this.canvas.getContext('2d');
	this.context.putImageData(imageData, 0, 0);
	this.context.fillStyle = '1px solid #ff0000';
};
Layer.prototype.show = function() {
	document.body.appendChild(this.canvas);
	//this.context.fillRect(50, 50, 2, 2);
};
Layer.prototype.drawPoint = function(point) {
	//console.log(this);
	//console.log(xPixel, yPixel);
	var pixel = this.pixel(point);
	this.context.fillRect(pixel.x, pixel.y, 2, 2);
};
Layer.prototype.pixel = function(point) {
	var xOffset = point.x - this.min.x;
	var yOffset = point.y - this.min.y;
	//console.log(xOffset, yOffset);
	var width = this.max.x - this.min.x;
	var height = this.max.y - this.min.y;
	//console.log(width, height);
	var xPercent = xOffset / width;
	var yPercent = yOffset / height;
	//console.log(xPercent, yPercent);
	var xPixel = parseInt(xPercent * this.width);
	var yPixel = parseInt(yPercent * this.height);
	return {
		x: xPixel,
		y: yPixel
	};
};
Layer.prototype.drawRect = function(min, max) {
	var minPixel = this.pixel(min);
	var maxPixel = this.pixel(max);
	//console.log(minPixel, maxPixel);
};