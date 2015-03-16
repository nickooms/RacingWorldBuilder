var Wegknoop = function() {
	
};
Wegknoop.parse = function(knoop, parameters) {
	knoop = knoop.replace("GetFeatureInfo results:\n\nLayer 'GRB_WKN'\n  Feature", '');
	return {
		objectType: 'Wegknoop',
		id: parseInt(knoop.split(':')[0]),
		width: parameters.WIDTH,
		height: parameters.HEIGHT,
		bbox: parameters.BBOX,
		x: parameters.I,
		y: parameters.J
	};
};