var Wegsegment = function(id, status) {
	this.id = id;
	this.status = status;
};
Wegsegment.prototype.load = function(callback) {
	var load = function(wegsegment) {
  	var lineString = wegsegment.Geometrie.replace('LINESTRING (', '').replace(')', '').split(', ');
  	var line = [];
  	for (var i = 0; i < lineString.length; i++) {
  		var point = lineString[i].split(' ');
  		line.push({
  			x: parseFloat(point[0]),
  			y: parseFloat(point[1])
  		});
  	}
  	this.line = line;
  	this.geometrieMethode = wegsegment.GeometriemethodeWegsegment
    callback.bind(this)();
  };
	$R.GetWegsegmentByIdentificatorWegsegment(this.id).then(load.bind(this));
  return this;
};