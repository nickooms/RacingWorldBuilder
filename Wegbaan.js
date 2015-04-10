var Wegbaan = function(properties) {
	this.type = null;
	this.id = null;
	this.lengte = null;
	this.oppervl = null;
	this.points = [];
	for (var propertyName in properties) {
		this[propertyName] = properties[propertyName];
	}
	this.wegknopen = {};
	this.wegverbindingen = {};
};
Wegbaan.COLOR = {
	wegsegment: {
		find: 0xcccccc,
		fill: 0x00ff00,
		flood: 0x00ff00ff
	},
	kruispuntzone: {
		find: 0xb7b7b7,
		fill: 0xff0000,
		flood: 0xff0000ff
	}
};
Wegbaan.prototype.getLayer = function(layerName) {
	var wegbaan = this;
	return new Promise(function(resolve, reject) {
		var width = 100;
		var height = 100;
		var bbox = wegbaan.bbox();
		var min = new Point(bbox[0], bbox[1]);
		var max = new Point(bbox[2], bbox[3]);
		WMS.getMap(layerName, width, height, min.x, min.y, max.x, max.y, wegbaan).then(function(map) {
			var wegbaan = map.object;
			//var canvas = new Canvas('Wegopdeling' + wegbaan.id, map.imageData, '1px solid #000000');
			//canvas.setPosition(map.bbox);
			//$R.Wegbanen.get(189873)
			//canvas.id = 'Wegopdeling' + wegbaan.id;
			var layer = new Layer({
				id: 'Wegopdeling' + wegbaan.id,
				layerName: layerName,
				imageData: map.imageData,
				min: min,
				max: max
			});
			resolve(layer);
		});
	});
};
Wegbaan.prototype.bbox = function() {
	if (this._bbox === undefined) {
		var radius = this.radius();
		var radius = 2 * Math.max(radius.lengte, radius.oppervl);
		var min = {
			x: Infinity,
			y: Infinity
		};
		var max = {
			x: -Infinity,
			y: -Infinity
		};
	} else {
		var radius = 0;
		var min = {
			x: this._bbox[0],
			y: this._bbox[1]
		};
		var max = {
			x: this._bbox[2],
			y: this._bbox[3]
		};
	}
	for (var point of this.points) {
		var bbox = point.bbox;
		min.x = Math.min(min.x, bbox[0]);
		min.y = Math.min(min.y, bbox[1]);
		max.x = Math.max(max.x, bbox[2]);
		max.y = Math.max(max.y, bbox[3]);
	}
	min.x = parseInt(min.x - radius);
	min.y = parseInt(min.y - radius);
	max.x = parseInt(max.x + radius);
	max.y = parseInt(max.y + radius);
	var bbox = [min.x, min.y, max.x, max.y];
	this._bbox = bbox;
	return bbox;
};
Wegbaan.prototype.radius = function() {
	var lengte = this.lengte / (2 * Math.PI);
	var oppervl = Math.sqrt(this.oppervl / Math.PI);
	return {
		lengte: lengte,
		oppervl: oppervl
	};
};
Wegbaan.prototype.addPoint = function(point) {
	this.points.push(point);
};
Wegbaan.parse = function(wegbaan, parameters) {
	wegbaan = wegbaan.replace("GetFeatureInfo results:\n\nLayer 'GRB_WBN'\n  Feature", '').split(':');
	var properties = wegbaan[1].split('\n');
	var bbox = parameters.BBOX;
	wegbaan = new Wegbaan({
		id: parseInt(wegbaan[0])
	});
	for (var i = 0; i < properties.length; i++) {
		var property = properties[i].split(' = ');
		if (property.length == 2) {
			var propertyName = property[0].replace('    ', '');
			var propertyValue = property[1].split("'").join('');
			switch (propertyName) {
				case 'uidn':
				case 'oidn':
				case 'opndatum':
				case 'type':
				case 'gid':
					break;
				case 'lengte':
				case 'oppervl':
					wegbaan[propertyName] = parseFloat(propertyValue);
					break;
				case 'lbltype':
					wegbaan.type = propertyValue;
					break;
				default:
					wegbaan[propertyName] = propertyValue;
			}
		}
	}
	wegbaan.addPoint({
		width: parameters.WIDTH,
		height: parameters.HEIGHT,
		bbox: [parseInt(bbox[0]), parseInt(bbox[1]), parseInt(bbox[2]), parseInt(bbox[3])],
		x: parameters.I,
		y: parameters.J
	});
	return wegbaan;
};