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
  post: function(name, parameters, singleObject) {
		return new Promise(function(resolve, reject) {
			var post = $R.encodePost(name, parameters);
			var cache = localStorage[JSON.stringify(post)];
			if (cache === undefined) {
				$.post($R.POST, post, function (data) {
		    	var response = $R.html(data);
		    	if (singleObject === true) {
		    		response = response[0];
		    	}
		    	localStorage[JSON.stringify(post)] = JSON.stringify(response);
		    	resolve(response);
		    }, 'html');
			} else {
				resolve(JSON.parse(cache));
			}
		});
	},
	encodePost: function(name, parameters) {
		var parametersJson = [];
		for (var parameterName in parameters) {
			parametersJson.push({
				Name: parameterName,
				Value: parameters[parameterName]
			});
		}
		return {
      operation: name,
      parametersJson: JSON.stringify(parametersJson)
    };
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
    if ($R[operation].parameters != null) {
    	$R.onParametersReceived($R[operation].parameters);
    } else {
	    $.post('/Examples/Home/Parameters', {
	      operation: operation
	    }, function (data) {
	    	console.log(operation + '==' + data);
	    	$R[operation].parameters = data;
	      $R.onParametersReceived(data);
	    }, 'json');
	  }
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
    $.post($R.POST, {
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
  html: function(data) {
		var rows = data.replace("<table border='1' cellspacing='0'><tr><td>", '').split('</td></tr></table>')[0].split('<i>').join('').split('</i>').join('').split('<b>').join('').split('</b>').join('').split('</td></tr><tr><td>');
		var colNames = rows[0].split('</td><td>');
		var objects = [];
		for (var i = 1; i < rows.length; i++) {
			var row = rows[i].split('</td><td>');
			rows[i] = {};
			for (var j = 0; j < row.length; j++) {
				switch (colNames[j]) {
					case 'GewestId':
					case 'GemeenteId':
					case 'BeginBewerking':
					case 'BeginOrganisatie':
					case 'HuisnummerId':
					case 'StatusHuisnummer':
					case 'IdentificatorGebouw':
					case 'StatusGebouw':
					case 'IdentificatorWegobject':
					case 'AardWegobject':
					case 'IdentificatorWegsegment':
					case 'StatusWegsegment':
					case 'GeometriemethodeWegsegment':
						row[j] = parseInt(row[j]);
						break;
					case 'CenterX':
					case 'CenterY':
					case 'MinimumX':
					case 'MinimumY':
					case 'MaximumX':
					case 'MaximumY':
						row[j] = parseFloat(row[j].replace(',', '.'));
				}
				rows[i][colNames[j]] = row[j];
			}
			objects.push(rows[i]);
		}
		return objects;
	},
  showGemeente: function(gemeenteNaam, straatNaam) {
  	var listGebouwen = function() {
	  	if ($R.huisNummers.length > 0) {
		  	$R.ListGebouwenByHuisnummerId($R.huisNummers[0].HuisnummerId).then(function(gebouwen) {
		  		$R.huisNummers[0].identificatorGebouw = gebouwen.map(function(gebouw) {
		  			return gebouw.IdentificatorGebouw;
		  		});
		  		if ($R.huisNummers[0].identificatorGebouw.length !== 0) {
		  			getGebouw();
		  		} else {
		  			$R.huisNummers = $R.huisNummers.slice(1);
		  			listGebouwen();
		  		}
		  	});
			} else {
 				console.log($R.huizen.join('\n'));
			}
	  };
		var getGebouw = function() {
			$R.GetGebouwByIdentificatorGebouw($R.huisNummers[0].identificatorGebouw[0]).then(function(gebouw) {
				var huis = gebouw.Geometrie;
			  huis = huis.split('POLYGON ((')[1].split('))')[0].split(', ');
			  huis.pop();
			  huis = 'addComplexHuis([[' + huis.join('],[').split(' ').join(',') + ']]);';
			  $R.huizen.push(huis);
			  $R.huisNummers[0].identificatorGebouw = $R.huisNummers[0].identificatorGebouw.slice(1);
			  if ($R.huisNummers[0].identificatorGebouw.length > 0) {
			  	getGebouw();
			  } else {
			    $R.huisNummers = $R.huisNummers.slice(1);
			    listGebouwen();
			  }
			});
		};
    $R.gemeenteNaam = gemeenteNaam;
    $R.straatNaam = straatNaam;
    $R.GetGemeenteByGemeenteNaam(gemeenteNaam).then(function(gemeente) {
    	$R.gemeenteId = gemeente.GemeenteId;
    	$R.nisGemeenteCode = gemeente.NisGemeenteCode;
    	$R.FindStraatnamen(gemeente.GemeenteId, straatNaam).then(function(straatnamen) {
    		$R.straatNaamId = straatnamen[0].StraatnaamId;
    		$R.straat = new Straat(parseInt($R.gemeenteId), parseInt($R.straatNaamId)).loadLocation(function() {
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
    			$R.ListWegobjectenByStraatnaamId(this.id).then(function(wegobjecten) {
    				$R.straat.wegobjectenCount = 0;
					  $R.straat.wegobjectenLoaded = 0;
					  for (var wegobject of wegobjecten) {
					    $R.straat.wegobjectenCount++;
					    var wegobject = new Wegobject(wegobject.IdentificatorWegobject, wegobject.AardWegobject).load(function() {
					      $R.straat.wegobjectenLoaded++;
					      $R.gml.push(GML.point(this.center));
					      $R.gml.push(GML.polygon([this.min, { x: this.max.x, y: this.min.y }, this.max, { x: this.min.x, y: this.max.y }, this.min]));
					      if ($R.straat.wegobjectenLoaded == $R.straat.wegobjectenCount) {
					        $R.ListWegsegmentenByStraatnaamId($R.straat.id).then(function(wegsegmenten) {
					        	$R.straat.wegsegmentenCount = 0;
									  $R.straat.wegsegmentenLoaded = 0;
									  for (var wegsegment of wegsegmenten) {
									    $R.straat.wegsegmentenCount++;
									    var wegsegment = new Wegsegment(wegsegment.IdentificatorWegsegment, wegsegment.StatusWegsegment).load(function() {
									      $R.straat.wegsegmentenLoaded++;
									      for (var point of this.line) {
									        $R.gml.push(GML.point(point));
									      }
									      $R.gml.push(GML.line(this.line));
									      if ($R.straat.wegsegmentenCount == $R.straat.wegsegmentenLoaded) {
									        $R.gml.push(GML.END);
									        console.log($R.gml.join('\n'));
									        $R.ListHuisnummersWithStatusByStraatnaamId($R.straat.id).then(function(huisNummers) {
											    	$R.huisNummers = huisNummers.filter(function(huisNummer) {
											    		if (huisNummer.StatusHuisnummer == 3) {
								      					return {
													        huisnummerId: huisNummer.HuisnummerId,
													        huisnummer: huisNummer.Huisnummer
													      };
													    } else {
													    	return null;
													    }
													  });
													  listGebouwen();
											    });
									      }
									    });
									    $R.wegsegmenten.push(wegsegment);
					      		}
					        });
					      }
					    });
					    $R.wegobjecten.push(wegobject);
    				}
    			});
			  });
    	});
    });
  }
};
$R.GetWegobjectByIdentificatorWegobject = function(identificatorWegobject) {
	return $R.post('GetWegobjectByIdentificatorWegobject', {
		IdentificatorWegobject: identificatorWegobject
	}, true);
};
$R.GetWegsegmentByIdentificatorWegsegment = function(identificatorWegsegment) {
	return $R.post('GetWegsegmentByIdentificatorWegsegment', {
		IdentificatorWegsegment: identificatorWegsegment
	}, true);
};
$R.GetGemeenteByGemeenteNaam = function(gemeenteNaam, gewestId) {
	return $R.post('GetGemeenteByGemeenteNaam', {
		GemeenteNaam: gemeenteNaam,
		GewestId: gewestId || 2
	}, true);
	/*return new Promise(function(resolve, reject) {
		var post = $R.encodePost('GetGemeenteByGemeenteNaam', {
			GemeenteNaam: gemeenteNaam,
			GewestId: gewestId || 2
		});
		var cache = localStorage[JSON.stringify(post)];
		if (cache === undefined) {
			console.log(JSON.stringify(post));
	    $.post($R.POST, post, function (data) {
	    	var response = $R.html(data)[0];
	    	localStorage[JSON.stringify(post)] = JSON.stringify(response);
	    	resolve(response);
	    }, 'html');
	  } else {
	  	resolve(JSON.parse(cache));
	  }
	});*/
};
/*$R.GetGemeenteByGemeenteNaam.parameters = [{
	Name: "GemeenteNaam",
	Value: null,
	Type: "String"
}, {
	Name: "GewestId",
	Value: null,
	Type: "Int32"
}];
$R.GetGemeenteByGemeenteNaam.request = function() {
	$('#GemeenteNaamTxt').val($R.gemeenteNaam);
  $('#GewestIdTxt').val(2);
  $R.execOperation($R.GetGemeenteByGemeenteNaam.response);
};
$R.GetGemeenteByGemeenteNaam.response = function() {
	$R.gemeenteId = $('#results').find('tr:gt(0)').find('td:nth-child(2)').text();
  $R.nisGemeenteCode = $('#results').find('tr:gt(0)').find('td:nth-child(7)').text();
  $R.changeOperation('FindStraatnamen', $R.FindStraatnamen.request);
};*/
$R.FindStraatnamen = function(gemeenteId, straatNaam, sorteerVeld) {
	return $R.post('FindStraatnamen', {
		GemeenteId: gemeenteId,
		Straatnaam: straatNaam,
		SorteerVeld: sorteerVeld || 0
	});
	/*return new Promise(function(resolve, reject) {
		var post = $R.encodePost('FindStraatnamen', {
			GemeenteId: gemeenteId,
			Straatnaam: straatNaam,
			SorteerVeld: sorteerVeld || 0
		});
		var cache = localStorage[JSON.stringify(post)];
		if (cache === undefined) {
	    $.post($R.POST, post, function (data) {
	    	var response = $R.html(data);
	    	localStorage[JSON.stringify(post)] = JSON.stringify(response);
	    	resolve(response);
	    }, 'html');
	  } else {
	  	resolve(JSON.parse(cache));
	  }
	});*/
};
/*$R.FindStraatnamen.parameters = [{
	Name: "Straatnaam",
	Value: null,
	Type: "String"
}, {
	Name: "GemeenteId",
	Value: null,
	Type: "Int32"
}, {
	Name: "SorteerVeld",
	Value: null,
	Type: "Int32"
}];
$R.FindStraatnamen.request = function() {
	$('#StraatnaamTxt').val($R.straatNaam);
  $('#GemeenteIdTxt').val($R.gemeenteId);
  $R.execOperation($R.FindStraatnamen.response);
};
$R.FindStraatnamen.response = function() {
	$R.straatNaamId = $('#results').find('tr:gt(0)').find('td:first').text();
  $R.straat = new Straat(parseInt($R.gemeenteId), parseInt($R.straatNaamId)).getLocation(function() {
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
    //$R.changeOperation('ListWegobjectenByStraatnaamId', $R.ListWegobjectenByStraatnaamId.request);
    $R.changeOperation('ListHuisnummersWithStatusByStraatnaamId', $R.ListHuisnummersWithStatusByStraatnaamId.request);
  });
};*/
$R.ListWegobjectenByStraatnaamId = function(straatNaamId, sorteerVeld) {
	return $R.post('ListWegobjectenByStraatnaamId', {
		StraatnaamId: straatNaamId,
		SorteerVeld: sorteerVeld || 0
	});
	/*return new Promise(function(resolve, reject) {
    $.post($R.POST, {
      operation: 'ListWegobjectenByStraatnaamId',
      parametersJson: JSON.stringify([
      	{ Name: 'StraatnaamId', Value: straatNaamId },
      	{ Name: 'SorteerVeld', Value: sorteerVeld || 0 }
      ])
    }, function (data) {
    	resolve($R.html(data));
    }, 'html');
	});*/
};
/*$R.ListWegobjectenByStraatnaamId.parameters = [{
	Name: "StraatnaamId",
	Value: null,
	Type: "Int32"
}, {
	Name: "SorteerVeld",
	Value: null,
	Type: "Int32"
}];
$R.ListWegobjectenByStraatnaamId.request = function() {
	$('#StraatnaamIdTxt').val($R.straatNaamId);
  $R.execOperation($R.ListWegobjectenByStraatnaamId.response);
};
$R.ListWegobjectenByStraatnaamId.response = function() {
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
};*/
$R.ListWegsegmentenByStraatnaamId = function(straatNaamId, sorteerVeld) {
	return $R.post('ListWegsegmentenByStraatnaamId', {
		StraatnaamId: straatNaamId,
		SorteerVeld: sorteerVeld || 0
	});
	/*return new Promise(function(resolve, reject) {
    $.post($R.POST, {
      operation: 'ListWegsegmentenByStraatnaamId',
      parametersJson: JSON.stringify([
      	{ Name: 'StraatnaamId', Value: straatNaamId },
      	{ Name: 'SorteerVeld', Value: sorteerVeld || 0 }
      ])
    }, function (data) {
    	resolve($R.html(data));
    }, 'html');
	});*/
};
/*$R.ListWegsegmentenByStraatnaamId.parameters = [{
	Name: "StraatnaamId",
	Value: null,
	Type: "Int32"
}, {
	Name: "SorteerVeld",
	Value: null,
	Type: "Int32"
}];
$R.ListWegsegmentenByStraatnaamId.request = function() {
	$('#StraatnaamIdTxt').val($R.straatNaamId);
  $R.execOperation($R.ListWegsegmentenByStraatnaamId.response);
};
$R.ListWegsegmentenByStraatnaamId.response = function() {
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
};*/
$R.ListHuisnummersWithStatusByStraatnaamId = function(straatNaamId, sorteerVeld) {
	return $R.post('ListHuisnummersWithStatusByStraatnaamId', {
		StraatnaamId: straatNaamId,
		SorteerVeld: sorteerVeld || 0
	});
	/*return new Promise(function(resolve, reject) {
		var post = $R.encodePost('ListHuisnummersWithStatusByStraatnaamId', {
			StraatnaamId: straatNaamId,
			SorteerVeld: sorteerVeld || 0
		});
		var cache = localStorage[JSON.stringify(post)];
		if (cache === undefined) {
			$.post($R.POST, post, function (data) {
	    	var response = $R.html(data);
	    	localStorage[JSON.stringify(post)] = JSON.stringify(response);
	    	resolve(response);
	    }, 'html');
		} else {
			resolve(JSON.parse(cache));
		}
	});*/
};
/*$R.ListHuisnummersWithStatusByStraatnaamId.parameters = [{
  Name: "StraatnaamId",
  Value: null,
  Type: "Int32"
}, {
  Name: "SorteerVeld",
  Value: null,
  Type: "Int32"
}];
$R.ListHuisnummersWithStatusByStraatnaamId.request = function() {
  $('#StraatnaamIdTxt').val($R.straatNaamId);
  $R.execOperation($R.ListHuisnummersWithStatusByStraatnaamId.response);
};
$R.ListHuisnummersWithStatusByStraatnaamId.response = function() {
  $('#results').find('tr:gt(0)').each(function(i) {
    var status = $(this).find('td:nth-child(3)').text();
    if (status === '3') {
      $R.huisNummers.push({
        huisnummerId: $(this).find('td:first').text(),
        huisnummer: $(this).find('td:nth-child(2)').text()
      });
    }
  });
  $R.changeOperation('ListGebouwenByHuisnummerId', $R.ListGebouwenByHuisnummerId.request);
};*/
$R.ListGebouwenByHuisnummerId = function(huisNummerId, sorteerVeld) {
	return $R.post('ListGebouwenByHuisnummerId', {
		HuisnummerId: huisNummerId,
		SorteerVeld: sorteerVeld || 0
	});
	/*return new Promise(function(resolve, reject) {
		var post = $R.encodePost('ListGebouwenByHuisnummerId', {
			HuisnummerId: huisNummerId,
			SorteerVeld: sorteerVeld || 0
		});
		var cache = localStorage[JSON.stringify(post)];
		if (cache === undefined) {
			$.post($R.POST, post, function (data) {
	    	var response = $R.html(data);
	    	localStorage[JSON.stringify(post)] = JSON.stringify(response);
	    	resolve(response);
	    }, 'html');
		} else {
			resolve(JSON.parse(cache));
		}
	});*/
};
/*$R.ListGebouwenByHuisnummerId.parameters = [{
	Name: "HuisnummerId",
	Value: null,
	Type: "Int32"
}, {
	Name: "SorteerVeld",
	Value: null,
	Type: "Int32"
}];
$R.ListGebouwenByHuisnummerId.request = function() {
  if ($R.huisNummers.length > 0) {
    $('#HuisnummerIdTxt').val($R.huisNummers[0].huisnummerId);
    $R.execOperation($R.ListGebouwenByHuisnummerId.response);
  } else {
    console.log($R.huizen.join('\n'));
  }
};
$R.ListGebouwenByHuisnummerId.response = function() {
  $R.huisNummers[0].identificatorGebouw = [];
  $('#results').find('tr:gt(0)').each(function(i) {
    var identificatorGebouw = $(this).find('td:first').text();
    $R.huisNummers[0].identificatorGebouw.push(identificatorGebouw);
  });
  if ($R.huisNummers[0].identificatorGebouw.length !== 0) {
    $R.changeOperation('GetGebouwByIdentificatorGebouw', $R.GetGebouwByIdentificatorGebouw.request);
  } else {
    $R.huisNummers = $R.huisNummers.slice(1);
    $R.changeOperation('ListGebouwenByHuisnummerId', $R.ListGebouwenByHuisnummerId.request);
  }
};*/
$R.GetGebouwByIdentificatorGebouw = function(identificatorGebouw) {
	return $R.post('GetGebouwByIdentificatorGebouw', {
		IdentificatorGebouw: identificatorGebouw
	}, true);
	/*return new Promise(function(resolve, reject) {
		var post = $R.encodePost('GetGebouwByIdentificatorGebouw', {
			IdentificatorGebouw: identificatorGebouw
		});
		var cache = localStorage[JSON.stringify(post)];
		if (cache === undefined) {
	    $.post($R.POST, post, function (data) {
	    	var response = $R.html(data)[0];
	    	localStorage[JSON.stringify(post)] = JSON.stringify(response);
	    	resolve(response);
	    }, 'html');
	  } else {
	  	resolve(JSON.parse(cache));
	  }
	});*/
};
/*$R.GetGebouwByIdentificatorGebouw.parameters = [{
	Name: "IdentificatorGebouw",
	Value: null,
	Type: "String"
}];
$R.GetGebouwByIdentificatorGebouw.request = function() {
  $('#IdentificatorGebouwTxt').val($R.huisNummers[0].identificatorGebouw[0]);
  $R.execOperation($R.GetGebouwByIdentificatorGebouw.response);
};
$R.GetGebouwByIdentificatorGebouw.response = function() {
  var huis = $('#results').find('tr:gt(0)').find('td:nth-child(5)').text();
  console.log($R.huisNummers[0].huisnummer);
  huis = huis.split('POLYGON ((')[1].split('))')[0].split(', ');
  huis.pop();
  huis = 'addComplexHuis([[' + huis.join('],[').split(' ').join(',') + ']]);';
  $R.huizen.push(huis);
  $R.huisNummers[0].identificatorGebouw = $R.huisNummers[0].identificatorGebouw.slice(1);
  if ($R.huisNummers[0].identificatorGebouw.length > 0) {
    $R.changeOperation('GetGebouwByIdentificatorGebouw', $R.GetGebouwByIdentificatorGebouw.request);
  } else {
    $R.huisNummers = $R.huisNummers.slice(1);
    $R.changeOperation('ListGebouwenByHuisnummerId', $R.ListGebouwenByHuisnummerId.request);
  }
};*/
chrome.runtime.onConnect.addListener(function(port) {
  $R.port = port;
  port.onMessage.addListener($R.onMessage);
});