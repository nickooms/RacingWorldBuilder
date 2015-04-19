var Kruispuntzone = function(wegbaan) {
	this.wegbaan = wegbaan.id;
	this.wegknopen = [];
};
Kruispuntzone.prototype.getWegknopen = function() {
	var wegbaan = $R.Wegbanen.get(this.wegbaan);
	for (var wegknoopId in wegbaan.wegknopen) {
		var knoop = $R.wegknopen[wegknoopId];
		var wegknoop = new Wegknoop(knoop);
		this.wegknopen.push(wegknoop);
	}
	return this.wegknopen;
};
Kruispuntzone.prototype.getNames = function() {
	var uniqueNames = {};
	this.names = [];
	for (var wegknoop of this.wegknopen) {
		for (var name of wegknoop.getNames()) {
			uniqueNames[name] = name;
		}
	}
	for (var name in uniqueNames) {
		this.names.push(name);
	}
	return this.names;
};
Kruispuntzone.prototype.log = function() {
	console.groupCollapsed(this.names.join(', '));
	for (var wegknoop of this.wegknopen) {
		console.log(wegknoop.names.join(', '));
	}
	console.groupEnd();
};
Kruispuntzone.prototype.getName = function() {
	var wegbaan = $R.Wegbanen.get(this.wegbaan);
	var kruispuntzoneNames = {};
	for (var wegknoopId in wegbaan.wegknopen) {
		var wegknoop = $R.wegknopen[wegknoopId];
		console.log(wegknoop);
		wegknoop.wegbaan = this.wegbaan.id;
		wegknoop.getName();
		wegknoop.links = {};
		wegknoop.getLinks();
		kruispuntzone.wegknopen.push(wegknoop);
	}
	var s3 = [$R.straatNaam];
	for (var name in kruispuntzoneNames) {
		s3.push(name);
	}
	this.name = s3.join(', ');
}