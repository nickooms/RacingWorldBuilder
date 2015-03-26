var Canvas = function(imageData, border) {
	var canvas = document.createElement('canvas');
	canvas.width = imageData.width;
	canvas.height = imageData.height;
	var context = canvas.getContext('2d');
	context.putImageData(imageData, 0, 0);
	if (border !== undefined) {
		canvas.style.border = border;
	}
	return canvas;
};