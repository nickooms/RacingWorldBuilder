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
  return this;
};