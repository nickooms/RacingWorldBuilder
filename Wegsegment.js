var Wegsegment = function(id, status) {
	this.id = id;
	this.status = status;
};
Wegsegment.prototype.load = function(callback) {
	$.post($R.POST, {
    operation: 'GetWegsegmentByIdentificatorWegsegment',
    parametersJson: JSON.stringify([{
    	Name: 'IdentificatorWegsegment',
    	Value: this.id
    }])
  }, (function (data) {
  	var row = $R.row(data);
  	var lineString = row[3].replace('LINESTRING (', '').replace(')', '').split(', ');
  	var line = [];
  	for (var i = 0; i < lineString.length; i++) {
  		var point = lineString[i].split(' ');
  		line.push({
  			x: parseFloat(point[0]),
  			y: parseFloat(point[1])
  		});
  	}
  	this.geometrieMethode = parseInt(row[2]);
  	this.line = line;
    console.log(this);
    callback.bind(this)();
  }).bind(this), 'html');
  return this;
};