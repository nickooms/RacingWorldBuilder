var Wegbanen = function() {
	this._loading = 0;
	this._loaded = null;
};
Wegbanen.prototype = new Array();
Wegbanen.prototype.constructor = Wegbanen;
Wegbanen.prototype.add = function(newWegbaan) {
	if (newWegbaan === undefined) {
		this._loading++;
	} else {
		var wegbaan;
		if (this.exists(newWegbaan)) {
			wegbaan = this.get(newWegbaan);
			wegbaan.addPoint(newWegbaan.points[0]);
		} else {
			wegbaan = this[this.push(newWegbaan) - 1];
		}
		this._loading--;
		if (this._loading === 0) {
			this.loaded();
		}
		return wegbaan
	}
};
Wegbanen.prototype.remove = function() {
	this._loading--;
	if (this._loading === 0) {
		this.loaded();
	}
};
Wegbanen.prototype.loaded = function(loaded) {
	if (loaded !== undefined) {
		this._loaded = loaded;
	} else {
		this._loaded.call(this);
		this._loaded = null;
	}
};
Wegbanen.prototype.get = function(newWegbaan) {
	var id;
	if (newWegbaan instanceof Wegbaan) {
		id = newWegbaan.id;
	} else {
		if (typeof newWegbaan === 'number') {
			//console.log('WEGBAAN:'+newWegbaan);
			id = newWegbaan;
		}
	}
	if (id != undefined) {
		for (var wegbaan of this) {
			if (wegbaan.id === id) {
				return wegbaan;
			}
		}
	}
};
Wegbanen.prototype.exists = function(wegbaan) {
	for (var i = 0; i < this.length; i++) {
		if (this[i].id === wegbaan.id) {
			return true
		}
	}
	return false;
};