window.Racing = {
  APP_ID: 'anoednchafajddgcjghfampiefekeoca',
  SVG: 'http://www.w3.org/2000/svg',
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
      case 'copyLayer':
        Racing.copyLayer();
        break;
    }
  },
  init: function() {
    Racing.huisNummers = [];
    Racing.huizen = [];
  },
  onOperationChanged: function () {
    $('#paramsTable').find('tr:gt(0)').remove();
    $.post('/Examples/Home/Parameters', { operation: $("#operationList").val() }, function (data) { Racing.onParametersReceived(data); }, 'json');
  },
  onParametersReceived: function(parameterList) {
    for (var i = 0; i < parameterList.length; i++) {
      $('#paramsTable tr:last').after('<tr><td>' + parameterList[i].Name + '</td><td><input type="text" id="' + parameterList[i].Name + 'Txt" style="width:98%;"/></td><td>' + parameterList[i].Type + '</td></tr>');
    }
    Racing.nextAction();
  },
  onExecOperation: function() {
    var params = new Array();
    $('#paramsTable').find('tr:gt(0)').each(function (i) {
      var param = new Object();
      param.Name = $(this).find('td:first').html();
      param.Value = $(this).find('td:nth-child(2)').find(':input').val();
      params.push(param);
    });
    $('#results').html();
    $.post('/Examples/Home/ExecOperation', { operation: $("#operationList").val(), parametersJson: JSON.stringify(params) }, function (data) { Racing.onOperationExecuted(data); }, 'html');
  },
  onOperationExecuted: function(result) {
    $('#results').html(result);
    Racing.nextAction();
  },
  getGemeenteByGemeenteNaam: function() {
    $('#GemeenteNaamTxt').val(Racing.gemeenteNaam);
    $('#GewestIdTxt').val(2);
    Racing.nextAction = Racing.getGemeenteByGemeenteNaamResponse;
    Racing.onExecOperation();
  },
  getGemeenteByGemeenteNaamResponse: function() {
    Racing.gemeenteId = $('#results').find('tr:gt(0)').find('td:nth-child(2)').text();
    Racing.nisGemeenteCode = $('#results').find('tr:gt(0)').find('td:nth-child(7)').text();
    $('#operationList').val('FindStraatnamen');
    Racing.nextAction = Racing.findStraatnamen;
    Racing.onOperationChanged();
  },
  findStraatnamen: function() {
    $('#StraatnaamTxt').val(Racing.straatNaam);
    $('#GemeenteIdTxt').val(Racing.gemeenteId);
    $('#SorteerVeldTxt').val(0);
    Racing.nextAction = Racing.findStraatnamenResponse;
    Racing.onExecOperation();
  },
  findStraatnamenResponse: function() {
    Racing.straatNaamId = $('#results').find('tr:gt(0)').find('td:first').text();
    $('#operationList').val('ListHuisnummersWithStatusByStraatnaamId');
    Racing.nextAction = Racing.listHuisnummersWithStatusByStraatnaamId;
    Racing.onOperationChanged();
  },
  listHuisnummersWithStatusByStraatnaamId: function() {
    console.log(Racing.straatNaamId);
    $('#StraatnaamIdTxt').val(Racing.straatNaamId);
    $('#SorteerVeldTxt').val(0);
    Racing.nextAction = Racing.listHuisnummersWithStatusByStraatnaamIdResponse;
    Racing.onExecOperation();
  },
  listHuisnummersWithStatusByStraatnaamIdResponse: function() {
    $('#results').find('tr:gt(0)').each(function(i) {
      var status = $(this).find('td:nth-child(3)').text();
      if (status === '3') {
        Racing.huisNummers.push({
          huisnummerId: $(this).find('td:first').text(),
          huisnummer: $(this).find('td:nth-child(2)').text()
        });
        console.log($(this).find('td:nth-child(2)').text());
      }
    });
    console.log('======================');
    $('#operationList').val('ListGebouwenByHuisnummerId');
    Racing.nextAction = Racing.listGebouwenByHuisnummerId;
    Racing.onOperationChanged();
  },
  listGebouwenByHuisnummerId: function() {
    if (Racing.huisNummers.length > 0) {
      $('#HuisnummerIdTxt').val(Racing.huisNummers[0].huisnummerId);
      $('#SorteerVeldTxt').val(0);
      Racing.nextAction = Racing.listGebouwenByHuisnummerIdResponse;
      Racing.onExecOperation();
    } else {
      console.log(Racing.huizen.join('\n'));
    }
  },
  listGebouwenByHuisnummerIdResponse: function() {
    Racing.huisNummers[0].identificatorGebouw = $('#results').find('tr:gt(0)').find('td:first').text();
    if (Racing.huisNummers[0].identificatorGebouw !== '') {
      console.log('\t' + Racing.huisNummers[0].identificatorGebouw + ':' + Racing.huisNummers[0].huisnummerId);
      $('#operationList').val('GetGebouwByIdentificatorGebouw');
      Racing.nextAction = Racing.getGebouwByIdentificatorGebouw;
      Racing.onOperationChanged();
    } else {
      Racing.huisNummers = Racing.huisNummers.slice(1);
      $('#operationList').val('ListGebouwenByHuisnummerId');
      Racing.nextAction = Racing.listGebouwenByHuisnummerId;
      Racing.onOperationChanged();
    }
  },
  getGebouwByIdentificatorGebouw: function() {
    $('#IdentificatorGebouwTxt').val(Racing.huisNummers[0].identificatorGebouw);
    Racing.nextAction = Racing.getGebouwByIdentificatorGebouwResponse;
    Racing.onExecOperation();
  },
  getGebouwByIdentificatorGebouwResponse: function() {
    var huis = $('#results').find('tr:gt(0)').find('td:nth-child(5)').text();
    console.log(Racing.huisNummers[0].huisnummer);
    huis = huis.split('POLYGON ((')[1].split('))')[0].split(', ');
    huis.pop();
    huis = 'addComplexHuis([[' + huis.join('],[').split(' ').join(',') + ']]);';
    Racing.huizen.push(huis);
    Racing.huisNummers = Racing.huisNummers.slice(1);
    $('#operationList').val('ListGebouwenByHuisnummerId');
    Racing.nextAction = Racing.listGebouwenByHuisnummerId;
    Racing.onOperationChanged();
  },
  showGemeente: function(gemeenteNaam, straatNaam, layer, layerName, k, zoomToScale, straatLine, straatLinePoint, layers, layerNames) {
    Racing.gemeenteNaam = gemeenteNaam;
    Racing.straatNaam = straatNaam;
    $('#operationList').val('GetGemeenteByGemeenteNaam');
    Racing.nextAction = Racing.getGemeenteByGemeenteNaam;
    Racing.onOperationChanged();
  }
}
chrome.runtime.onConnect.addListener(function(port) {
  Racing.port = port;
  port.onMessage.addListener(Racing.onMessage);
});