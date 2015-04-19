var Wegverbindingen = function() {};
Wegverbindingen.parse = function(wegverbindingen, parameters) {
	wegverbindingen = wegverbindingen.replace("GetFeatureInfo results:\n\nLayer 'GRB_WVB'\n  Feature", '').split('  Feature');
	for (var i = 0; i < wegverbindingen.length; i++) {
		var wegverbinding = wegverbindingen[i].split('\n');
		wegverbindingen[i] = {
			objectType: 'Wegverbinding',
			id: parseInt(wegverbinding[0].split(':')[0]),
			width: parameters.WIDTH,
			height: parameters.HEIGHT,
			bbox: parameters.BBOX,
			x: parameters.I,
			y: parameters.J,
			wegknopen: {}
		};
		for (var j = 1; j < wegverbinding.length; j++) {
			var property = wegverbinding[j].split(' = ');
			if (property.length === 2) {
				var propertyName = property[0].replace('    ', '');
				var propertyValue = property[1].split("'").join('');
				switch (propertyName) {
					case 'uidn':
					case 'oidn':
					case 'lniscode':
					case 'lstrnmid':
					case 'rniscode':
					case 'rstrnmid':
					case 'verh':
					case 'wegnummer':
					case 'morf':
					case 'opndatum':
					case 'lgemeente':
					case 'rgemeente':
					case 'rstrnm':
						break;
					case 'gid':
						wegverbindingen[i].id = parseInt(propertyValue);
						break;
					case 'lstrnm':
						wegverbindingen[i].straatnaam = propertyValue;
						break;
					case 'lengte':
						wegverbindingen[i].lengte = parseFloat(propertyValue);
						break;
					default:
						wegverbindingen[i][propertyName] = propertyValue;
				}
			}
		}
	}
	return wegverbindingen;
};