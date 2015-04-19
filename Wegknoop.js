var Wegknoop = function(knoop) {
	this.id = knoop.id;
	this.bbox = knoop.bbox;
	this.width = knoop.width;
	this.height = knoop.height;
	this.x = knoop.x;
	this.y = knoop.y;
	this.wegverbindingen = knoop.wegverbindingen;
};
Wegknoop.prototype.getNames = function() {
	var uniqueNames = {};
	this.names = [];
	for (var wegverbindingId in this.wegverbindingen) {
		var wegverbinding = $R.wegverbindingen[wegverbindingId];
		var straatnaam = wegverbinding.straatnaam;
		uniqueNames[straatnaam] = straatnaam;
	}
	for (var name in uniqueNames) {
		this.names.push(name);
	}
	return this.names;
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
		y: parameters.J,
		wegverbindingen: {}
	};
};
Wegknoop.prototype.getLinks = function() {
	console.log('Wegknoop.getLinks()');
	for (var wegverbinding of wegverbindingen) {
		var wegknopen = wegverbinding.wegknopen;
		for (var linkWegknoopId in wegknopen) {
			if (linkWegknoopId !== wegknoopId) {
				var linkWegknoop = $R.wegknopen[linkWegknoopId];
				var linkWegverbindingen = {};
				for (var linkWegverbindingId in linkWegknoop.wegverbindingen) {
					var linkWegverbindingName = linkWegknoop.wegverbindingen[linkWegverbindingId];
					linkWegverbindingen[linkWegverbindingName] = linkWegverbindingName;
				}
				var s2 = [];
				for (var name in linkWegverbindingen) {
					s2.push(name);
				}
				var linkWegknoopName = s2.join(', ');
				linkWegknoop.name = linkWegknoopName;
				this.links[linkWegknoopId] = linkWegknoop;
			}
		}
	}
};
Wegknoop.prototype.getName = function() {
	console.log('Wegknoop.getName()');
	var names = {};
	var wegverbindingen = [];
	for (var wegverbindingId in this.wegverbindingen) {
		var wegverbindingName = this.wegverbindingen[wegverbindingId];
		if (wegverbindingName != $R.straatNaam) {
			names[wegverbindingName] = wegverbindingName;
			kruispuntzoneNames[wegverbindingName] = wegverbindingName;
		} else {
			var wegverbinding = $R.wegverbindingen[wegverbindingId];
			wegverbindingen.push(wegverbinding);
		}
	}
	var s = [$R.straatNaam];
	for (var name in names) {
		s.push(name);
	}
	this.name = s.join(', ');
};