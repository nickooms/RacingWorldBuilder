var Wegobject = function(id, aard) {
	this.id = id;
	this.aard = aard;
};
Wegobject.prototype.load = function(callback) {
	var load = function(wegobject) {
		this.center = {
  		x: wegobject.CenterX,
  		y: wegobject.CenterY
  	};
  	this.min = {
  		x: wegobject.MinimumX,
  		y: wegobject.MinimumY
  	};
  	this.max = {
  		x: wegobject.MaximumX,
  		y: wegobject.MaximumY
  	};
  	callback.bind(this)();
	};
	$R.GetWegobjectByIdentificatorWegobject(this.id).then(load.bind(this));
	/*$.post($R.POST, {
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
    callback.bind(this)();
  }).bind(this), 'html');*/
  return this;
};