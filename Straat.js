var Straat = function(gemeenteId, id) {
	this.id = id;
	this.gemeenteId = gemeenteId;
};
Straat.prototype.loadLocation = function(callback) {
	var cacheLocation = function(response) {
		localStorage[JSON.stringify(parameters)] = response;
		parseLocation.bind(this)(JSON.parse(response));
	};
	var parseLocation = function (object) {
		var bounds = object.Bounds.split(',');
  	this.center = {
  		x: parseFloat(object.LambertX),
  		y: parseFloat(object.LambertY)
  	};
  	this.min = {
  		x: parseFloat(bounds[0]),
  		y: parseFloat(bounds[1])
  	};
  	this.max = {
  		x: parseFloat(bounds[2]),
  		y: parseFloat(bounds[3])
  	};
    callback.bind(this)();
  };
	var parameters = {
		operation: 'GetLocation',
		parametersJson: JSON.stringify([{
			Name: 'GemeenteId',
			Value: this.gemeenteId
		}, {
			Name: 'StraatId',
			Value: this.id
		}])
	}
	var url = $R.GET + 'GetLocation/?GemeenteId=' + this.gemeenteId + '&StraatId=' + this.id;
	var cache = localStorage[JSON.stringify(parameters)];
	if (cache === undefined) {
		$.get(url, cacheLocation.bind(this), 'html');
	} else {
		parseLocation.bind(this)(JSON.parse(cache));
	}
  return this;
};