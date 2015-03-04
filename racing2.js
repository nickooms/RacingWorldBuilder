$R = window.Racing = {
  APP_ID: 'anoednchafajddgcjghfampiefekeoca',
  SVG: 'http://www.w3.org/2000/svg',
  POST: '/Examples/Home/ExecOperation',
  addLayersTimeout: 0,
  vecLayer: null,
  timestamp: null,
  canvas: null,
  ready: false,
  onMessage: function(msg) {
    if (!Racing.ready) {
      Racing.init();
    }
    switch (msg.action) {
      case 'showGemeente':
        Racing.showGemeente(msg.gemeenteNaam, msg.straatNaam, msg.layer, msg.layerName, msg.k, msg.zoomToScale, msg.straatLine, msg.straatLinePoint, msg.layers, msg.layerNames);
        break;
    }
  },
  row: function(data) {
    return data.split('</tr><tr><td>')[1].split('</td></tr>')[0].split('</td><td>');
  },
  gmlPoint: function(point) {
    var coordinates = [point.x.toFixed(2), point.y.toFixed(2)].join(',');
    return [
      ' <gml:featureMember>',
      '   <agiv:GV_Feature>',
      '     <gml:pointProperty>',
      '       <gml:Point srsName="EPSG:31370">',
      '         <gml:coordinates decimal="." cs="," ts=" ">' + coordinates + '</gml:coordinates>',
      '       </gml:Point>',
      '     </gml:pointProperty>',
      '   </agiv:GV_Feature>',
      ' </gml:featureMember>'
    ].join('\n');
  },
  gmlLine: function(line) {
    var coordinates = [];
    for (var i = 0; i < line.length; i++) {
      var point = line[i];
      var coordinate = [point.x.toFixed(2), point.y.toFixed(2)].join(',');
      coordinates.push(coordinate);
    };
    return [
      ' <gml:featureMember>',
      '   <agiv:GV_Feature>',
      '     <gml:polygonProperty>',
      '       <gml:Polygon srsName="EPSG:31370">',
      '         <gml:outerBoundaryIs>',
      '           <gml:LinearRing>',
      '             <gml:coordinates decimal="." cs="," ts=" ">' + coordinates.join(' ') + '</gml:coordinates>',
      '           </gml:LinearRing>',
      '         </gml:outerBoundaryIs>',
      '       </gml:Polygon>',
      '     </gml:polygonProperty>',
      '   </agiv:GV_Feature>',
      ' </gml:featureMember>'
    ].join('\n');
  },
  init: function() {
    Racing.huisNummers = [];
    Racing.wegobjecten = [];
    Racing.wegsegmenten = [];
    Racing.huizen = [];
    Racing.gml = [];
  },
  changeOperation: function(operation, callback) {
    $('#operationList').val(operation);
    Racing.nextAction = callback;
    $('#paramsTable').find('tr:gt(0)').remove();
    $.post('/Examples/Home/Parameters', {
      operation: $("#operationList").val()
    }, function (data) {
      Racing.onParametersReceived(data);
    }, 'json');
  },
  onParametersReceived: function(parameterList) {
    for (var i = 0; i < parameterList.length; i++) {
      $('#paramsTable tr:last').after('<tr><td>' + parameterList[i].Name + '</td><td><input type="text" id="' + parameterList[i].Name + 'Txt" style="width:98%;"/></td><td>' + parameterList[i].Type + '</td></tr>');
    }
    Racing.nextAction();
  },
  execOperation: function(callback) {
    $('#SorteerVeldTxt').val(0);
    Racing.nextAction = callback;
    var params = new Array();
    $('#paramsTable').find('tr:gt(0)').each(function (i) {
      var param = new Object();
      param.Name = $(this).find('td:first').html();
      param.Value = $(this).find('td:nth-child(2)').find(':input').val();
      params.push(param);
    });
    $('#results').html();
    $.post('/Examples/Home/ExecOperation', {
      operation: $("#operationList").val(),
      parametersJson: JSON.stringify(params)
    }, function (data) {
      Racing.onOperationExecuted(data);
    }, 'html');
  },
  onOperationExecuted: function(result) {
    $('#results').html(result);
    Racing.nextAction();
  },
  getGemeenteByGemeenteNaam: function() {
    $('#GemeenteNaamTxt').val(Racing.gemeenteNaam);
    $('#GewestIdTxt').val(2);
    Racing.execOperation(Racing.getGemeenteByGemeenteNaamResponse);
  },
  getGemeenteByGemeenteNaamResponse: function() {
    Racing.gemeenteId = $('#results').find('tr:gt(0)').find('td:nth-child(2)').text();
    Racing.nisGemeenteCode = $('#results').find('tr:gt(0)').find('td:nth-child(7)').text();
    Racing.changeOperation('FindStraatnamen', Racing.findStraatnamen);
  },
  findStraatnamen: function() {
    $('#StraatnaamTxt').val(Racing.straatNaam);
    $('#GemeenteIdTxt').val(Racing.gemeenteId);
    Racing.execOperation(Racing.findStraatnamenResponse);
  },
  findStraatnamenResponse: function() {
    Racing.straatNaamId = $('#results').find('tr:gt(0)').find('td:first').text();
    Racing.changeOperation('ListWegobjectenByStraatnaamId', Racing.listWegobjectenByStraatnaamId);
    //Racing.changeOperation('ListHuisnummersWithStatusByStraatnaamId', Racing.listHuisnummersWithStatusByStraatnaamId);
  },
  listWegobjectenByStraatnaamId: function() {
    $('#StraatnaamIdTxt').val(Racing.straatNaamId);
    Racing.execOperation(Racing.listWegobjectenByStraatnaamIdResponse);
  },
  listWegobjectenByStraatnaamIdResponse: function() {
    $('#results').find('tr:gt(0)').each(function(i) {
      var id = parseInt($(this).find('td:first').text());
      var aard = parseInt($(this).find('td:nth-child(2)').text());
      var wegobject = new Wegobject(id, aard).load(function() {
        var gml = $R.gmlPoint(this.center);
        console.log(gml);
        $R.gml.push(gml);
      });
      Racing.wegobjecten.push(wegobject);
      //console.log(wegobject);
    });
    //console.log('======================');
    Racing.changeOperation('ListWegsegmentenByStraatnaamId', Racing.listWegsegmentenByStraatnaamId);
  },
  listWegsegmentenByStraatnaamId: function() {
    $('#StraatnaamIdTxt').val(Racing.straatNaamId);
    Racing.execOperation(Racing.listWegsegmentenByStraatnaamIdResponse);
  },
  listWegsegmentenByStraatnaamIdResponse: function() {
    $('#results').find('tr:gt(0)').each(function(i) {
      var id = parseInt($(this).find('td:first').text());
      var status = parseInt($(this).find('td:nth-child(2)').text());
      var wegsegment = new Wegsegment(id, status).load(function() {
        for (var i = 0; i < this.line.length; i++) {
          var gml = $R.gmlPoint(this.line[i]);
          console.log(gml);
          $R.gml.push(gml);
        }
        var gml = $R.gmlLine(this.line);
        console.log(gml);
        $R.gml.push(gml);
      });
      Racing.wegsegmenten.push(wegsegment);
    });
    //console.log('======================');
  },
  listHuisnummersWithStatusByStraatnaamId: function() {
    $('#StraatnaamIdTxt').val(Racing.straatNaamId);
    Racing.execOperation(Racing.listHuisnummersWithStatusByStraatnaamIdResponse);
  },
  listHuisnummersWithStatusByStraatnaamIdResponse: function() {
    $('#results').find('tr:gt(0)').each(function(i) {
      var status = $(this).find('td:nth-child(3)').text();
      if (status === '3') {
        Racing.huisNummers.push({
          huisnummerId: $(this).find('td:first').text(),
          huisnummer: $(this).find('td:nth-child(2)').text()
        });
      }
    });
    console.log('======================');
    Racing.changeOperation('ListGebouwenByHuisnummerId', Racing.listGebouwenByHuisnummerId);
  },
  listGebouwenByHuisnummerId: function() {
    if (Racing.huisNummers.length > 0) {
      $('#HuisnummerIdTxt').val(Racing.huisNummers[0].huisnummerId);
      Racing.execOperation(Racing.listGebouwenByHuisnummerIdResponse);
    } else {
      console.log(Racing.huizen.join('\n'));
    }
  },
  listGebouwenByHuisnummerIdResponse: function() {
    Racing.huisNummers[0].identificatorGebouw = [];
    $('#results').find('tr:gt(0)').each(function(i) {
      var identificatorGebouw = $(this).find('td:first').text();
      Racing.huisNummers[0].identificatorGebouw.push(identificatorGebouw);
    });
    if (Racing.huisNummers[0].identificatorGebouw.length !== 0) {
      Racing.changeOperation('GetGebouwByIdentificatorGebouw', Racing.getGebouwByIdentificatorGebouw);
    } else {
      Racing.huisNummers = Racing.huisNummers.slice(1);
      Racing.changeOperation('ListGebouwenByHuisnummerId', Racing.listGebouwenByHuisnummerId);
    }
  },
  getGebouwByIdentificatorGebouw: function() {
    $('#IdentificatorGebouwTxt').val(Racing.huisNummers[0].identificatorGebouw[0]);
    Racing.execOperation(Racing.getGebouwByIdentificatorGebouwResponse);
  },
  getGebouwByIdentificatorGebouwResponse: function() {
    var huis = $('#results').find('tr:gt(0)').find('td:nth-child(5)').text();
    console.log(Racing.huisNummers[0].huisnummer);
    huis = huis.split('POLYGON ((')[1].split('))')[0].split(', ');
    huis.pop();
    huis = 'addComplexHuis([[' + huis.join('],[').split(' ').join(',') + ']]);';
    Racing.huizen.push(huis);
    Racing.huisNummers[0].identificatorGebouw = Racing.huisNummers[0].identificatorGebouw.slice(1);
    if (Racing.huisNummers[0].identificatorGebouw.length > 0) {
      Racing.changeOperation('GetGebouwByIdentificatorGebouw', Racing.getGebouwByIdentificatorGebouw);
    } else {
      Racing.huisNummers = Racing.huisNummers.slice(1);
      Racing.changeOperation('ListGebouwenByHuisnummerId', Racing.listGebouwenByHuisnummerId);
    }
  },
  showGemeente: function(gemeenteNaam, straatNaam, layer, layerName, k, zoomToScale, straatLine, straatLinePoint, layers, layerNames) {
    Racing.gemeenteNaam = gemeenteNaam;
    Racing.straatNaam = straatNaam;
    Racing.changeOperation('GetGemeenteByGemeenteNaam', Racing.getGemeenteByGemeenteNaam);
  }
}
chrome.runtime.onConnect.addListener(function(port) {
  Racing.port = port;
  port.onMessage.addListener(Racing.onMessage);
});