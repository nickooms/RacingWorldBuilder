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
ImageData.prototype.removeColors = function(colorsToRemove) {
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
			for (var colorToRemove of colorsToRemove) {
				if (color === colorToRemove) {
					data[offset] = data[offset + 1] = data[offset + 2] = data[offset + 3] = 0;
				}
			}
		}
	}
};
ImageData.prototype.removeTransparent = function(transparent) {
	transparent = transparent || 0xff;
	var data = this.data;
	var width = this.width;
	var height = this.height;
	for (var x = 0; x < width; x++) {
		for (var y = 0; y < height; y++) {
			var offset = (x + y * width) * 4;
			var a = data[offset + 3];
			if (a < transparent) {
				data[offset] = data[offset + 1] = data[offset + 2] = data[offset + 3] = 0;
			}
		}
	}
};
ImageData.prototype.removeRange = function(rMin, rMax, gMin, gMax, bMin, bMax) {
	var data = this.data;
	var width = this.width;
	var height = this.height;
	for (var x = 0; x < width; x++) {
		for (var y = 0; y < height; y++) {
			var offset = (x + y * width) * 4;
			var r = data[offset];
			var g = data[offset + 1];
			var b = data[offset + 2];
			if (rMin <= r && r <= rMax && gMin <= g && g <= gMax && bMin <= b && b <= bMax) {
				data[offset] = data[offset + 1] = data[offset + 2] = data[offset + 3] = 0;
			}
		}
	}
};
ImageData.prototype.showColors = function() {
	var data = this.data;
	var width = this.width;
	var height = this.height;
	var colors = {};
	for (var x = 0; x < width; x++) {
		for (var y = 0; y < height; y++) {
			var offset = (x + y * width) * 4;
			var r = data[offset];
			var g = data[offset + 1];
			var b = data[offset + 2];
			var a = data[offset + 3];
			var color = (r << 16 | g << 8 | b).toString(16);
			/*if (color === colorToRemove) {
				data[offset] = data[offset + 1] = data[offset + 2] = data[offset + 3] = 0;
			}*/
			//if (a === 0xff) {
				if (colors[color] === undefined) {
					colors[color] = 0;
				}
				colors[color]++;
			//}
		}
	}
	var divs = [];
	for (var color in colors) {
		var hexColor = '#' + color.toString(16);
		divs.push('<div title="' + hexColor + '" onclick="console.log(\'' + hexColor + '\'); document.body.bgColor = \'' + hexColor + '\';" style="background-color: ' + hexColor + ';width: 10px; height: 10px"></div>');
	}
	var div = document.createElement('div');
	div.innerHTML = divs.join('');
	document.body.appendChild(div);
	console.log(colors);
};