var Straat = function(gemeenteId, id) {
	this.id = id;
	this.gemeenteId = gemeenteId;
};
Straat.prototype.load = function(callback) {
	$.get($R.GET + 'GetLocation/?GemeenteId=' + this.gemeenteId + '&StraatId=' + this.id, (function (data) {
		var object = JSON.parse(data);
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
  }).bind(this), 'html');
  return this;
};