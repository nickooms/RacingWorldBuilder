var LayerType = function(id, short, name) {
	this.id = id;
	this.short = short;
	this.name = name;
};
LayerType.prototype.getMap = function(object, bbox, width, height) {
	var layerType = this;
	return new Promise(function(resolve, reject) {
		var min = bbox.min;
		var max = bbox.max;
		var layerName = layerType.id;
		var id = layerType.short + object.id;
		var mapLoaded = WMS.getMap(layerName, width, height, min.x, min.y, max.x, max.y, object);
		mapLoaded.then(function(map) {
			var object = map.object;
			var canvas = new Canvas(id, map.imageData, '1px solid #000000');
			canvas.setPosition(map.bbox);
			canvas.style.display = 'none';
			$R.group(object.id).appendChild(canvas);
			object.layers[layerName] = {
				bbox: map.bbox,
				width: map.width,
				height: map.height
			};
			resolve(map);
		});
	});
};