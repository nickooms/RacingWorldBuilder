$R = window.Racing = {
	MARGIN: 50,
  APP_ID: 'anoednchafajddgcjghfampiefekeoca',
  GET: 'http://geo-vlaanderen.agiv.be/CRABREST/crab.svc/',//GetLocation/?GemeenteId=23&StraatId=7338 || TestPostkanton
  POST: '/Examples/Home/ExecOperation',
  ready: false,
  onMessage: function(msg) {
    if (!$R.ready) {
      $R.init();
    }
    switch (msg.action) {
      case 'showGemeente':
        $R.showGemeente(msg.gemeenteNaam, msg.straatNaam);
        break;
    }
  },
  row: function(data) {
    return data.split('</tr><tr><td>')[1].split('</td></tr>')[0].split('</td><td>');
  },
  init: function() {
    $R.huisNummers = [];
    $R.wegobjecten = [];
    $R.wegsegmenten = [];
    $R.huizen = [];
    $R.gml = [];
    $R.ready = true;
  },
  changeOperation: function(operation, callback) {
    $('#operationList').val(operation);
    $R.nextAction = callback;
    $('#paramsTable').find('tr:gt(0)').remove();
    $.post('/Examples/Home/Parameters', {
      operation: $("#operationList").val()
    }, function (data) {
      $R.onParametersReceived(data);
    }, 'json');
  },
  onParametersReceived: function(parameterList) {
    for (var i = 0; i < parameterList.length; i++) {
    	var parameter = parameterList[i];
      $('#paramsTable tr:last').after('<tr><td>' + parameter.Name + '</td><td><input type="text" id="' + parameter.Name + 'Txt" style="width:98%;"/></td><td>' + parameter.Type + '</td></tr>');
    }
    $R.nextAction();
  },
  execOperation: function(callback) {
    $('#SorteerVeldTxt').val(0);
    $R.nextAction = callback;
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
      $R.onOperationExecuted(data);
    }, 'html');
  },
  onOperationExecuted: function(result) {
    $('#results').html(result);
    $R.nextAction();
  },
  /*getGemeenteByGemeenteNaam: function() {
    $('#GemeenteNaamTxt').val($R.gemeenteNaam);
    $('#GewestIdTxt').val(2);
    $R.execOperation($R.getGemeenteByGemeenteNaamResponse);
  },
  getGemeenteByGemeenteNaamResponse: function() {
    $R.gemeenteId = $('#results').find('tr:gt(0)').find('td:nth-child(2)').text();
    $R.nisGemeenteCode = $('#results').find('tr:gt(0)').find('td:nth-child(7)').text();
    $R.changeOperation('FindStraatnamen', $R.findStraatnamen);
  },*/
  /*findStraatnamen: function() {
    $('#StraatnaamTxt').val($R.straatNaam);
    $('#GemeenteIdTxt').val($R.gemeenteId);
    $R.execOperation($R.findStraatnamenResponse);
  },
  findStraatnamenResponse: function() {
    $R.straatNaamId = $('#results').find('tr:gt(0)').find('td:first').text();
    $R.straat = new Straat(parseInt($R.gemeenteId), parseInt($R.straatNaamId)).load(function() {
      console.log(this);
      $R.gml.push(GML.BEGIN);
      var margin = $R.MARGIN;
      var min = {
        x: this.min.x - margin,
        y: this.min.y - margin
      };
      var max = {
        x: this.max.x + margin,
        y: this.max.y + margin
      };
      $R.gml.push(GML.polygon([min, { x: max.x, y: min.y }, max, { x: min.x, y: max.y }, min]));
      $R.changeOperation('ListWegobjectenByStraatnaamId', $R.listWegobjectenByStraatnaamId);
    });
    //$R.changeOperation('ListHuisnummersWithStatusByStraatnaamId', $R.listHuisnummersWithStatusByStraatnaamId);
  },*/
  /*listWegobjectenByStraatnaamId: function() {
    $('#StraatnaamIdTxt').val($R.straatNaamId);
    $R.execOperation($R.listWegobjectenByStraatnaamIdResponse);
  },
  listWegobjectenByStraatnaamIdResponse: function() {
    $R.straat.wegobjectenCount = 0;
    $R.straat.wegobjectenLoaded = 0;
    $('#results').find('tr:gt(0)').each(function(i) {
      $R.straat.wegobjectenCount++;
      var id = parseInt($(this).find('td:first').text());
      var aard = parseInt($(this).find('td:nth-child(2)').text());
      var wegobject = new Wegobject(id, aard).load(function() {
        $R.straat.wegobjectenLoaded++;
        $R.gml.push(GML.point(this.center));
        $R.gml.push(GML.polygon([this.min, { x: this.max.x, y: this.min.y }, this.max, { x: this.min.x, y: this.max.y }, this.min]));
        if ($R.straat.wegobjectenLoaded == $R.straat.wegobjectenCount) {
          $R.changeOperation('ListWegsegmentenByStraatnaamId', $R.listWegsegmentenByStraatnaamId);
        }
      });
      $R.wegobjecten.push(wegobject);
    });
  },*/
  /*listWegsegmentenByStraatnaamId: function() {
    $('#StraatnaamIdTxt').val($R.straatNaamId);
    $R.execOperation($R.listWegsegmentenByStraatnaamIdResponse);
  },
  listWegsegmentenByStraatnaamIdResponse: function() {
    $R.straat.wegsegmentenCount = 0;
    $R.straat.wegsegmentenLoaded = 0;
    $('#results').find('tr:gt(0)').each(function(i) {
      $R.straat.wegsegmentenCount++;
      var id = parseInt($(this).find('td:first').text());
      var status = parseInt($(this).find('td:nth-child(2)').text());
      var wegsegment = new Wegsegment(id, status).load(function() {
        $R.straat.wegsegmentenLoaded++;
        for (var i = 0; i < this.line.length; i++) {
          $R.gml.push(GML.point(this.line[i]));
        }
        $R.gml.push(GML.line(this.line));
        if ($R.straat.wegsegmentenCount == $R.straat.wegsegmentenLoaded) {
          $R.gml.push(GML.END);
          console.log($R.gml.join('\n'));
        }
      });
      $R.wegsegmenten.push(wegsegment);
    });
  },*/
  listHuisnummersWithStatusByStraatnaamId: function() {
    $('#StraatnaamIdTxt').val($R.straatNaamId);
    $R.execOperation($R.listHuisnummersWithStatusByStraatnaamIdResponse);
  },
  listHuisnummersWithStatusByStraatnaamIdResponse: function() {
    $('#results').find('tr:gt(0)').each(function(i) {
      var status = $(this).find('td:nth-child(3)').text();
      if (status === '3') {
        $R.huisNummers.push({
          huisnummerId: $(this).find('td:first').text(),
          huisnummer: $(this).find('td:nth-child(2)').text()
        });
      }
    });
    $R.changeOperation('ListGebouwenByHuisnummerId', $R.listGebouwenByHuisnummerId);
  },
  listGebouwenByHuisnummerId: function() {
    if ($R.huisNummers.length > 0) {
      $('#HuisnummerIdTxt').val($R.huisNummers[0].huisnummerId);
      $R.execOperation($R.listGebouwenByHuisnummerIdResponse);
    } else {
      console.log($R.huizen.join('\n'));
    }
  },
  listGebouwenByHuisnummerIdResponse: function() {
    $R.huisNummers[0].identificatorGebouw = [];
    $('#results').find('tr:gt(0)').each(function(i) {
      var identificatorGebouw = $(this).find('td:first').text();
      $R.huisNummers[0].identificatorGebouw.push(identificatorGebouw);
    });
    if ($R.huisNummers[0].identificatorGebouw.length !== 0) {
      $R.changeOperation('GetGebouwByIdentificatorGebouw', $R.getGebouwByIdentificatorGebouw);
    } else {
      $R.huisNummers = $R.huisNummers.slice(1);
      $R.changeOperation('ListGebouwenByHuisnummerId', $R.listGebouwenByHuisnummerId);
    }
  },
  getGebouwByIdentificatorGebouw: function() {
    $('#IdentificatorGebouwTxt').val($R.huisNummers[0].identificatorGebouw[0]);
    $R.execOperation($R.getGebouwByIdentificatorGebouwResponse);
  },
  getGebouwByIdentificatorGebouwResponse: function() {
    var huis = $('#results').find('tr:gt(0)').find('td:nth-child(5)').text();
    console.log($R.huisNummers[0].huisnummer);
    huis = huis.split('POLYGON ((')[1].split('))')[0].split(', ');
    huis.pop();
    huis = 'addComplexHuis([[' + huis.join('],[').split(' ').join(',') + ']]);';
    $R.huizen.push(huis);
    $R.huisNummers[0].identificatorGebouw = $R.huisNummers[0].identificatorGebouw.slice(1);
    if ($R.huisNummers[0].identificatorGebouw.length > 0) {
      $R.changeOperation('GetGebouwByIdentificatorGebouw', $R.getGebouwByIdentificatorGebouw);
    } else {
      $R.huisNummers = $R.huisNummers.slice(1);
      $R.changeOperation('ListGebouwenByHuisnummerId', $R.listGebouwenByHuisnummerId);
    }
  },
  showGemeente: function(gemeenteNaam, straatNaam) {
    $R.gemeenteNaam = gemeenteNaam;
    $R.straatNaam = straatNaam;
    $R.changeOperation('GetGemeenteByGemeenteNaam', $R.GetGemeenteByGemeenteNaam.request);
  }
};
$R.GetGemeenteByGemeenteNaam = {
	request: function() {
		$('#GemeenteNaamTxt').val($R.gemeenteNaam);
    $('#GewestIdTxt').val(2);
    $R.execOperation($R.GetGemeenteByGemeenteNaam.response);
	},
	response: function() {
		$R.gemeenteId = $('#results').find('tr:gt(0)').find('td:nth-child(2)').text();
    $R.nisGemeenteCode = $('#results').find('tr:gt(0)').find('td:nth-child(7)').text();
    $R.changeOperation('FindStraatnamen', $R.FindStraatnamen.request);
	}
};
$R.FindStraatnamen = {
	request: function() {
		$('#StraatnaamTxt').val($R.straatNaam);
    $('#GemeenteIdTxt').val($R.gemeenteId);
    $R.execOperation($R.FindStraatnamen.response);
	},
	response: function() {
		$R.straatNaamId = $('#results').find('tr:gt(0)').find('td:first').text();
    $R.straat = new Straat(parseInt($R.gemeenteId), parseInt($R.straatNaamId)).load(function() {
      console.log(this);
      $R.gml.push(GML.BEGIN);
      var margin = $R.MARGIN;
      var min = {
        x: this.min.x - margin,
        y: this.min.y - margin
      };
      var max = {
        x: this.max.x + margin,
        y: this.max.y + margin
      };
      $R.gml.push(GML.polygon([min, { x: max.x, y: min.y }, max, { x: min.x, y: max.y }, min]));
      $R.changeOperation('ListWegobjectenByStraatnaamId', $R.ListWegobjectenByStraatnaamId.request);
    });
    //$R.changeOperation('ListHuisnummersWithStatusByStraatnaamId', $R.listHuisnummersWithStatusByStraatnaamId);
	}
};
$R.ListWegobjectenByStraatnaamId = {
	request: function() {
		$('#StraatnaamIdTxt').val($R.straatNaamId);
    $R.execOperation($R.ListWegobjectenByStraatnaamId.response);
	},
	response: function() {
		$R.straat.wegobjectenCount = 0;
    $R.straat.wegobjectenLoaded = 0;
    $('#results').find('tr:gt(0)').each(function(i) {
      $R.straat.wegobjectenCount++;
      var id = parseInt($(this).find('td:first').text());
      var aard = parseInt($(this).find('td:nth-child(2)').text());
      var wegobject = new Wegobject(id, aard).load(function() {
        $R.straat.wegobjectenLoaded++;
        $R.gml.push(GML.point(this.center));
        $R.gml.push(GML.polygon([this.min, { x: this.max.x, y: this.min.y }, this.max, { x: this.min.x, y: this.max.y }, this.min]));
        if ($R.straat.wegobjectenLoaded == $R.straat.wegobjectenCount) {
          $R.changeOperation('ListWegsegmentenByStraatnaamId', $R.ListWegsegmentenByStraatnaamId.request);
        }
      });
      $R.wegobjecten.push(wegobject);
    });
	}
};
$R.ListWegsegmentenByStraatnaamId = {
	request: function() {
		$('#StraatnaamIdTxt').val($R.straatNaamId);
    $R.execOperation($R.ListWegsegmentenByStraatnaamId.response);
	},
	response: function() {
		$R.straat.wegsegmentenCount = 0;
    $R.straat.wegsegmentenLoaded = 0;
    $('#results').find('tr:gt(0)').each(function(i) {
      $R.straat.wegsegmentenCount++;
      var id = parseInt($(this).find('td:first').text());
      var status = parseInt($(this).find('td:nth-child(2)').text());
      var wegsegment = new Wegsegment(id, status).load(function() {
        $R.straat.wegsegmentenLoaded++;
        for (var i = 0; i < this.line.length; i++) {
          $R.gml.push(GML.point(this.line[i]));
        }
        $R.gml.push(GML.line(this.line));
        if ($R.straat.wegsegmentenCount == $R.straat.wegsegmentenLoaded) {
          $R.gml.push(GML.END);
          console.log($R.gml.join('\n'));
        }
      });
      $R.wegsegmenten.push(wegsegment);
    });
	}
};
chrome.runtime.onConnect.addListener(function(port) {
  $R.port = port;
  port.onMessage.addListener($R.onMessage);
});