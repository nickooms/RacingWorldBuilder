var Wegobject = function(id, aard) {
	this.id = id;
	this.aard = aard;
};
Wegobject.prototype.load = function(callback) {
	$.post($R.POST, {
    operation: 'GetWegobjectByIdentificatorWegobject',
    parametersJson: JSON.stringify([{
    	Name: 'IdentificatorWegobject',
    	Value: this.id
    }])
  }, (function (data) {
  	var row = $R.row(data);
  	this.center = {
  		x: parseFloat(row[2].replace(',', '.')),
  		y: parseFloat(row[3].replace(',', '.'))
  	};
  	this.min = {
  		x: parseFloat(row[4].replace(',', '.')),
  		y: parseFloat(row[5].replace(',', '.'))
  	};
  	this.max = {
  		x: parseFloat(row[6].replace(',', '.')),
  		y: parseFloat(row[7].replace(',', '.'))
  	};
    console.log(this);
    callback.bind(this)();
  }).bind(this), 'html');
  return this;
};