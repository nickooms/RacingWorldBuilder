var LayerTypes = [
	new LayerType('GRB_WGO', 'Wegopdeling', 'GRB - WGO - wegopdeling'),
  new LayerType('GRB_WVB', 'Wegverbinding', 'GRB - WVB - wegverbinding')
];
LayerTypes.item = function(id) {
  return this.filter(function(layer) {
    return layer.id === id ? layer : null;
  })[0];
};