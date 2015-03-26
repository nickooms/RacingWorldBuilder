ImageData.prototype.removeColor = function(colorToRemove) {
	var data = this.data;
	var width = this.width;
	var height = this.height;
	for (var x = 0; x < width; x++) {
		for (var y = 0; y < height; y++) {
			var offset = (x + y * width) * 4;
			var r = data[offset];
			var g = data[offset + 1];
			var b = data[offset + 2];
			var color = r << 16 | g << 8 | b;
			if (color === colorToRemove) {
				data[offset] = data[offset + 1] = data[offset + 2] = data[offset + 3] = 0;
			}
		}
	}
};