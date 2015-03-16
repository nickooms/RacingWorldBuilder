var Wegbaan = function() {
	
};
Wegbaan.parse = function(wegbaan, parameters) {
	wegbaan = wegbaan.replace("GetFeatureInfo results:\n\nLayer 'GRB_WBN'\n  Feature", '').split(':');
	var properties = wegbaan[1].split('\n');
	wegbaan = {
		objectType: 'Wegbaan',
		id: parseInt(wegbaan[0]),
		width: parameters.WIDTH,
		height: parameters.HEIGHT,
		bbox: parameters.BBOX,
		x: parameters.I,
		y: parameters.J
	};
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
					break;
				case 'gid':
					wegbaan.id = parseInt(propertyValue);
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
	return wegbaan;
};