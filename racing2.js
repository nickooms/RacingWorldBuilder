$R = window.Racing = {
	MARGIN: 100,
  APP_ID: 'anoednchafajddgcjghfampiefekeoca',
  GET: 'http://geo-vlaanderen.agiv.be/CRABREST/crab.svc/',//GetLocation/?GemeenteId=23&StraatId=7338 || TestPostkanton
  POST: '/Examples/Home/ExecOperation',
  WMS_GRB: 'http://geo.api.agiv.be/geodiensten/raadpleegdiensten/GRB/wms?',
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
  wmsGetMap: function(layers, width, height, minX, minY, maxX, maxY) {
  	var parameters = {
  		LAYERS: layers || 'GRB_basiskaart',
  		EXCEPTIONS: 'XML',
  		FORMAT: 'image/png',
  		TRANSPARENT: 'TRUE',
  		VERSION: '1.3.0',
  		SERVICE: 'WMS',
  		REQUEST: 'GetMap',
  		STYLES: '',
  		ISBASELAYER: 'false',
  		REALMINSCALE: '15000',
  		REALMAXSCALE: '250',
  		CRS: 'EPSG:31370',
  		BBOX: [minX, minY, maxX, maxY].join(','),
  		WIDTH: width || 1000,
  		HEIGHT: height || 1000
  	};
  	var params = [];
  	for (var paramName in parameters) {
  		params.push(paramName + '=' + parameters[paramName]);
  	}
  	var url = $R.WMS_GRB + params.join('&');
  	return new Promise(function(resolve, reject) {
  		var processImageData = function(imageData) {
  			//console.log(url);
  			//console.log(imageData);
  			var parameters = {};
  			for (var param of url.replace($R.WMS_GRB, '').split('&')) {
  				param = param.split('=');
  				parameters[param[0]] = param[1];
  			}
  			resolve({
  				parameters: parameters,
  				imageData: imageData
  			});
  		};
  		var cache = localStorage[url];
  		if (cache === undefined) {
	  		var xhr = new XMLHttpRequest();
				xhr.open('GET', url, true);
				xhr.responseType = 'blob';
				xhr.onreadystatechange = function() {
				  if (xhr.readyState == 4) {
				    var img = new Image();
			  		img.onload = function(evt) {
			  			var image = evt.target;
			  			var width = image.width;
			  			var height = image.height;
			  			window.URL.revokeObjectURL(image.src);
			  			var canvas = document.createElement('canvas');
			  			canvas.width = width;
			  			canvas.height = height;
			  			var context = canvas.getContext('2d');
			  			context.drawImage(image, 0, 0);
			  			localStorage[xhr.responseURL] = canvas.toDataURL('image/png');
			  			var imageData = context.getImageData(0, 0, width, height);
			  			processImageData(imageData, xhr.responseURL);
			  		};
			  		var objectUrl = window.URL.createObjectURL(xhr.response);
				    img.src = objectUrl;
				  }
				};
				xhr.send();
			} else {
				var img = new Image();
	  		img.onload = function(evt) {
	  			var image = evt.target;
			  	var width = image.width;
			  	var height = image.height;
	  			var canvas = document.createElement('canvas');
	  			canvas.width = width;
			  	canvas.height = height;
	  			var context = canvas.getContext('2d');
	  			context.drawImage(image, 0, 0);
	  			var imageData = context.getImageData(0, 0, width, height);
	  			processImageData(imageData, url);
	  		};
		    img.src = cache;
			}
  	});
  },
  wmsGetFeatureInfo: function(layers, width, height, bbox, x, y) {
  	return new Promise(function(resolve, reject) {
  		var parameters = {
	  		LAYERS: layers || 'GRB_WKN',
	  		QUERY_LAYERS: layers || 'GRB_WKN',
	  		STYLES: '',
	  		SERVICE: 'WMS',
	  		VERSION: '1.3.0',
	  		REQUEST: 'GetFeatureInfo',
	  		EXCEPTIONS: 'XML',
	  		BBOX: bbox,
	  		FEATURE_COUNT: 10,
	  		WIDTH: width,
	  		HEIGHT: height,
	  		FORMAT: 'image/png',
	  		INFO_FORMAT: 'text/plain',
	  		CRS: 'EPSG:31370',
	  		I: x,
	  		J: y
	  	};
	  	var params = [];
	  	for (var paramName in parameters) {
	  		params.push(paramName + '=' + parameters[paramName]);
	  	}
	  	var url = $R.WMS_GRB + params.join('&');
	  	var parseResults = function(results) {
	  		switch (parameters.LAYERS) {
	  			case 'GRB_WKN':
	  				//resolve(parseWegknoop(results));
	  				resolve(Wegknoop.parse(results, parameters));
	  				break;
	  			case 'GRB_WVB':
	  				//resolve(parseWegverbindingen(results));
	  				resolve(Wegverbindingen.parse(results, parameters));
	  				break;
	  			case 'GRB_WBN':
	  				//resolve(parseWegbaan(results));
	  				resolve(Wegbaan.parse(results, parameters));
	  				break;
	  		}
	  	};
  		/*var parseWegknoop = function(knoop) {
  			knoop = knoop.replace("GetFeatureInfo results:\n\nLayer 'GRB_WKN'\n  Feature", '');
  			return {
  				objectType: 'Wegknoop',
  				id: parseInt(knoop.split(':')[0]),
  				width: parameters.WIDTH,
  				height: parameters.HEIGHT,
  				bbox: parameters.BBOX,
  				x: parameters.I,
  				y: parameters.J
  			};
  		};*/
  		/*var parseWegverbindingen = function(wegverbindingen) {
  			wegverbindingen = wegverbindingen.replace("GetFeatureInfo results:\n\nLayer 'GRB_WVB'\n  Feature", '').split('  Feature');
  			for (var i = 0; i < wegverbindingen.length; i++) {
  				var wegverbinding = wegverbindingen[i].split('\n');
  				wegverbindingen[i] = {
  					objectType: 'Wegverbinding',
  					id: parseInt(wegverbinding[0].split(':')[0]),
  					width: parameters.WIDTH,
	  				height: parameters.HEIGHT,
	  				bbox: parameters.BBOX,
	  				x: parameters.I,
	  				y: parameters.J
  				};
  				for (var j = 1; j < wegverbinding.length; j++) {
  					var property = wegverbinding[j].split(' = ');
  					if (property.length === 2) {
	  					var propertyName = property[0].replace('    ', '');
	  					var propertyValue = property[1].split("'").join('');
	  					switch (propertyName) {
	  						case 'uidn':
	  						case 'oidn':
	  						case 'lniscode':
	  						case 'lstrnmid':
	  						case 'rniscode':
	  						case 'rstrnmid':
	  						case 'verh':
	  						case 'wegnummer':
	  						case 'morf':
	  						case 'opndatum':
	  						case 'lgemeente':
	  						case 'rgemeente':
	  						case 'rstrnm':
	  							break;
	  						case 'gid':
	  							wegverbindingen[i].id = parseInt(propertyValue);
	  							break;
	  						case 'lstrnm':
	  							wegverbindingen[i].straatnaam = propertyValue;
	  							break;
	  						case 'lengte':
	  							wegverbindingen[i].lengte = parseFloat(propertyValue);
	  							break;
	  						default:
	  							wegverbindingen[i][propertyName] = propertyValue;
	  					}
	  				}
  				}
  			}
  			return wegverbindingen;
  		};*/
  		/*var parseWegbaan = function(wegbaan) {
  			wegbaan = wegbaan.replace("GetFeatureInfo results:\n\nLayer 'GRB_WBN'\n  Feature", '').split(':');
  			var properties = wegbaan[1].split('\n');
  			wegbaan = {
  				objectType: 'Wegbaan',
  				id: parseInt(wegbaan[0]),
  				width: parameters.WIDTH,
  				height: parameters.HEIGHT,
  				bbox: parameters.BBOX,
  				x: parameters.I,
  				y: parameters.J
  			};
  			for (var i = 0; i < properties.length; i++) {
  				var property = properties[i].split(' = ');
  				if (property.length == 2) {
  					var propertyName = property[0].replace('    ', '');
	  				var propertyValue = property[1].split("'").join('');
	  				switch (propertyName) {
	  					case 'uidn':
	  					case 'oidn':
	  					case 'opndatum':
	  					case 'type':
	  						break;
	  					case 'gid':
	  						wegbaan.id = parseInt(propertyValue);
	  						break;
	  					case 'lengte':
	  					case 'oppervl':
	  						wegbaan[propertyName] = parseFloat(propertyValue);
	  						break;
	  					case 'lbltype':
	  						wegbaan.type = propertyValue;
	  						break;
	  					default:
	  						wegbaan[propertyName] = propertyValue;
	  				}
  				}
  			}
  			return wegbaan;
  		};*/
  		var cache = localStorage[url];
  		if (cache === undefined) {
	  		var xhr = new XMLHttpRequest();
				xhr.open('GET', url, true);
				xhr.onreadystatechange = function() {
				  if (xhr.readyState == 4) {
				  	localStorage[url] = xhr.responseText;
				  	parseResults(xhr.responseText);
				  }
				};
				xhr.send();
			} else {
				parseResults(cache);
			}
		});
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
    $R.wegknopen = {};
    $R.wegverbindingen = {};
    $R.wegbanen = {};
    $R.huizen = [];
    $R.gml = [];
    $R.ready = true;
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
					case 'StraatnaamId':
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
 				//console.log($R.huizen.join('\n'));
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
		var wegsegmentLoaded = function() {
      $R.straat.wegsegmentenLoaded++;
      for (var point of this.line) {
        $R.gml.push(GML.point(point));
        var max = {
        	x: Math.ceil(point.x + 1),
        	y: Math.ceil(point.y + 1)
        };
        var min = {
        	x: Math.floor(point.x - 1),
        	y: Math.floor(point.y - 1)
        }
        var width = max.x - min.x;
	    	var height = max.y - min.y;
	    	$R.wmsGetMap('GRB_WKN', width * 10, height * 10, min.x, min.y, max.x, max.y).then(function(wegknoop) {
	    		var imageData = wegknoop.imageData;
	    		var data = imageData.data;
	    		var width = imageData.width;
	    		var height = imageData.height;
	    		var parameters = wegknoop.parameters;
	    		for (var x = 0; x < width; x++) {
	    			for (var y = 0; y < height; y++) {
	    				var offset = (y * width + x) * 4;
	    				var r = data[offset];
	    				var g = data[offset + 1];
	    				var b = data[offset + 2];
	    				var a = data[offset + 3];
	    				if (a === 0xff) {
	    					$R.wmsGetFeatureInfo('GRB_WKN', width, height, parameters.BBOX, x, y).then(function(knoop) {
	    						if ($R.wegknopen[knoop.id] === undefined) {
	    							knoop.wegverbindingen = {};
	    							$R.wegknopen[knoop.id] = knoop;
	    							console.log(knoop);
	    						}
	    						$R.wmsGetFeatureInfo('GRB_WVB', width, height, parameters.BBOX, x, y).then(function(wegverbindingen) {
	    							for (var wegverbinding of wegverbindingen) {
	    								if ($R.wegverbindingen[wegverbinding.id] === undefined) {
	    									wegverbinding.wegknopen = {};
	    									$R.wegverbindingen[wegverbinding.id] = wegverbinding;
	    									console.log(wegverbinding);
	    								}
	    								$R.wegverbindingen[wegverbinding.id].wegknopen[knoop.id] = knoop.id;
	    								$R.wegknopen[knoop.id].wegverbindingen[wegverbinding.id] = wegverbinding.straatnaam;
	    							}
	    						});
	    						$R.wmsGetFeatureInfo('GRB_WBN', width, height, parameters.BBOX, x, y).then(function(wegbaan) {
	    							if ($R.wegbanen[wegbaan.id] === undefined) {
	    								wegbaan.wegknopen = {};
	    								wegbaan.wegverbindingen = {};
	    								$R.wegbanen[wegbaan.id] = wegbaan;
	    								console.log(wegbaan);
	    							}
	    							$R.wegbanen[wegbaan.id].wegknopen[knoop.id] = knoop.id;
	    						});
	    					});
	    					return;
	    				}
	    			}
	    		}
	    		$R.wmsGetFeatureInfo('GRB_WBN', width, height, parameters.BBOX, x, y).then(function(wegbaan) {
	    			if ($R.wegbanen[wegbaan.id] === undefined) {
	    				wegbaan.wegknopen = {};
	    				wegbaan.wegverbindingen = {};
							$R.wegbanen[wegbaan.id] = wegbaan;
							console.log(wegbaan);
						}
	    		});
	    	});
      }
      $R.gml.push(GML.line(this.line));
      if ($R.straat.wegsegmentenCount == $R.straat.wegsegmentenLoaded) {
        $R.gml.push(GML.END);
        //console.log($R.gml.join('\n'));
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
    };
		var wegobjectLoaded = function() {
			$R.straat.wegobjectenLoaded++;
      $R.gml.push(GML.point(this.center));
      $R.gml.push(GML.polygon([this.min, { x: this.max.x, y: this.min.y }, this.max, { x: this.min.x, y: this.max.y }, this.min]));
      if ($R.straat.wegobjectenLoaded == $R.straat.wegobjectenCount) {
        $R.ListWegsegmentenByStraatnaamId($R.straat.id).then(function(wegsegmenten) {
        	$R.straat.wegsegmentenCount = wegsegmenten.length;
				  $R.straat.wegsegmentenLoaded = 0;
				  for (var wegsegment of wegsegmenten) {
				    var wegsegment = new Wegsegment(wegsegment.IdentificatorWegsegment, wegsegment.StatusWegsegment);
				    $R.wegsegmenten.push(wegsegment);
				    wegsegment.load(wegsegmentLoaded);
      		}
        });
      }
		};
		var straatLocationLoaded = function() {
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
	    var width = Math.ceil(max.x) - Math.floor(min.x);
	    var height = Math.ceil(max.y) - Math.floor(min.y);
	    //$R.wmsGetFeatureInfo('GRB_WKN');
	    //$R.wmsGetMap('GRB_WKN', width * 10, height * 10, Math.floor(min.x), Math.floor(min.y), Math.ceil(max.x), Math.ceil(max.y));
			$R.ListWegobjectenByStraatnaamId(this.id).then(function(wegobjecten) {
				$R.straat.wegobjectenCount = wegobjecten.length;
			  $R.straat.wegobjectenLoaded = 0;
			  for (var wegobject of wegobjecten) {
			    var wegobject = new Wegobject(wegobject.IdentificatorWegobject, wegobject.AardWegobject);
			    $R.wegobjecten.push(wegobject);
			    wegobject.load(wegobjectLoaded);
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
    		$R.straat = new Straat($R.gemeenteId, $R.straatNaamId);
    		$R.straat.loadLocation(straatLocationLoaded);
    	});
    });
  }
};
$R.GetWegobjectByIdentificatorWegobject = function(identificatorWegobject) {
	return $R.post('GetWegobjectByIdentificatorWegobject', {
		IdentificatorWegobject: identificatorWegobject
	}, true);
};
$R.GetWegsegmentByIdentificatorWegsegment = function(identificatorWegobject) {
	return $R.post('GetWegsegmentByIdentificatorWegsegment', {
		IdentificatorWegsegment: identificatorWegobject
	}, true);
};
$R.GetGemeenteByGemeenteNaam = function(gemeenteNaam, gewestId) {
	return $R.post('GetGemeenteByGemeenteNaam', {
		GemeenteNaam: gemeenteNaam,
		GewestId: gewestId || 2
	}, true);
};
$R.FindStraatnamen = function(gemeenteId, straatNaam, sorteerVeld) {
	return $R.post('FindStraatnamen', {
		GemeenteId: gemeenteId,
		Straatnaam: straatNaam,
		SorteerVeld: sorteerVeld || 0
	});
};
$R.ListWegobjectenByStraatnaamId = function(straatNaamId, sorteerVeld) {
	return $R.post('ListWegobjectenByStraatnaamId', {
		StraatnaamId: straatNaamId,
		SorteerVeld: sorteerVeld || 0
	});
};
$R.ListWegsegmentenByStraatnaamId = function(straatNaamId, sorteerVeld) {
	return $R.post('ListWegsegmentenByStraatnaamId', {
		StraatnaamId: straatNaamId,
		SorteerVeld: sorteerVeld || 0
	});
};
$R.ListHuisnummersWithStatusByStraatnaamId = function(straatNaamId, sorteerVeld) {
	return $R.post('ListHuisnummersWithStatusByStraatnaamId', {
		StraatnaamId: straatNaamId,
		SorteerVeld: sorteerVeld || 0
	});
};
$R.ListGebouwenByHuisnummerId = function(huisNummerId, sorteerVeld) {
	return $R.post('ListGebouwenByHuisnummerId', {
		HuisnummerId: huisNummerId,
		SorteerVeld: sorteerVeld || 0
	});
};
$R.GetGebouwByIdentificatorGebouw = function(identificatorWegobject) {
	return $R.post('GetGebouwByIdentificatorGebouw', {
		IdentificatorGebouw: identificatorWegobject
	}, true);
};
chrome.runtime.onConnect.addListener(function(port) {
  $R.port = port;
  port.onMessage.addListener($R.onMessage);
});