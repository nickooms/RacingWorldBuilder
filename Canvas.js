var Canvas = function(id, imageData, border) {
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	if (imageData !== undefined) {
		canvas.width = imageData.width;
		canvas.height = imageData.height;
		context.putImageData(imageData, 0, 0);
	}
	if (border !== undefined) {
		canvas.style.border = border;
	}
	canvas.id = id;
	//canvas.style.zIndex = 1;
	return canvas;
};
HTMLCanvasElement.prototype.getImageData = function() {
	return this.getContext('2d').getImageData(0, 0, this.width, this.height);
};
HTMLCanvasElement.prototype.setPosition = function(bbox) {
	var x = parseInt($R.straat.min.x) - bbox[0];
	var y = parseInt($R.straat.min.y) - bbox[1];
	var width = bbox[2] - bbox[0];
	var height = bbox[3] - bbox[1];
	var bounds = $R.straat.bounds;
	for (var i = 0; i < $R.Wegbanen.length; i++) {
		var wegbaan = $R.Wegbanen[i];
		if (wegbaan._bbox !== undefined) {
			bounds.addPoint(new Point(wegbaan._bbox[0], wegbaan._bbox[1]));
		}
	}
	var straatWidth = parseInt(bounds.width());
	var straatHeight  = parseInt(bounds.height());
	//console.log(x, y, width, height, straatWidth, straatHeight);
	var availWidth = window.screen.availWidth;
	var availHeight = window.screen.availHeight;
	var left = parseInt((x / straatWidth) * (availWidth));
	var top = parseInt((y / straatHeight) * (availHeight));
	var screenWidth = parseInt((width / straatWidth) * availWidth);
	var screenHeight = parseInt((height / straatHeight) * availHeight);
	//console.log(this.id, left, top, screenWidth, screenHeight);
	/*this.style.position = 'absolute';
	this.style.left = left + 'px';
	this.style.top = top + 'px';
	this.style.width = screenWidth + 'px';
	this.style.height = screenHeight + 'px';*/
};