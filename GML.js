window.GML = {
	BEGIN: '<agiv:FeatureCollection xmlns:gml="http://www.opengis.net/gml" xmlns:agiv="http://www.agiv.be/agiv" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.agiv.be/agiv http://gditestbed.agiv.be/XSD/GeneriekeViewer.xsd">',
	END: '</agiv:FeatureCollection>',
	point: function(point) {
    var coordinates = GML.coordinate(point);
    return [
      '	<gml:featureMember>',
      '		<agiv:GV_Feature>',
      '			<gml:pointProperty>',
      '				<gml:Point srsName="EPSG:31370">',
      '					<gml:coordinates decimal="." cs="," ts=" ">' + coordinates + '</gml:coordinates>',
      '				</gml:Point>',
      '			</gml:pointProperty>',
      '		</agiv:GV_Feature>',
      '	</gml:featureMember>'
    ].join('\n');
  },
  line: function(line) {
    var coordinates = [];
    for (var i = 0; i < line.length; i++) {
      coordinates.push(GML.coordinate(line[i]));
    };
    return [
      '	<gml:featureMember>',
      '		<agiv:GV_Feature>',
      '			<gml:lineStringProperty>',
      '				<gml:LineString srsName="EPSG:31370">',
      '					<gml:coordinates decimal="." cs="," ts=" ">' + coordinates.join(' ') + '</gml:coordinates>',
      '				</gml:LineString>',
      '			</gml:lineStringProperty>',
      '		</agiv:GV_Feature>',
      '	</gml:featureMember>'
    ].join('\n');
  },
  polygon: function(polygon) {
    var coordinates = [];
    for (var i = 0; i < polygon.length; i++) {
      coordinates.push(GML.coordinate(polygon[i]));
    };
    coordinates.push(GML.coordinate(polygon[0]));
    return [
      '	<gml:featureMember>',
      '		<agiv:GV_Feature>',
      '			<gml:polygonProperty>',
      '				<gml:Polygon srsName="EPSG:31370">',
      '					<gml:outerBoundaryIs>',
      '						<gml:LinearRing>',
      '							<gml:coordinates decimal="." cs="," ts=" ">' + coordinates.join(' ') + '</gml:coordinates>',
      '						</gml:LinearRing>',
      '					</gml:outerBoundaryIs>',
      '				</gml:Polygon>',
      '			</gml:polygonProperty>',
      '		</agiv:GV_Feature>',
      '	</gml:featureMember>'
    ].join('\n');
  },
  coordinate: function(point) {
    return [point.x.toFixed(2), point.y.toFixed(2)].join(',');
  }
};