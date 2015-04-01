$R = window.Racing = {
	MARGIN: 100,
	MAX_WIDTH: 4000,
	MAX_HEIGHT: 4000,
	MAX_SCALE: 5,
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
  	$('#results, h1, h2, select, table, br, input').css('display', 'none');
    $R.huisNummers = [];
    $R.wegobjecten = [];
    $R.wegsegmenten = [];
    $R.wegknopen = {};
    $R.wegverbindingen = {};
    $R.wegbanen = {};
    $R.huizen = [];
    $R.gml = [];
    $R.polygons = [];
    $R.polygonsBaan = [];
    $R.ready = true;
    $R.Wegbanen = new Wegbanen();
    $R.kruispuntzones = [];
    $R.Wegbanen.loaded(function() {
    	//console.log(this);
    	for (var wegbaan of this) {
    		//console.log([wegbaan.id, wegbaan.type]);
    		

    		var kruispuntzone;
  			var bbox = wegbaan.bbox();
  			$R.getWegbaanBounds(bbox, wegbaan, 1);
  			var bbox = wegbaan.bbox();
  			console.log(bbox);
  			console.log(wegbaan);
  			var width = Math.abs(bbox[0] - bbox[2]) * 5;
  			var height = Math.abs(bbox[1] - bbox[3]) * 5;
  			var min = new Point(Math.min(bbox[0], bbox[2]), Math.min(bbox[1], bbox[3]));
  			var max = new Point(Math.max(bbox[0], bbox[2]), Math.max(bbox[1], bbox[3]));
  			/*console.log(width);
  			console.log(height);
  			console.log(min);
  			console.log(max);*/
  			WMS.getMap('GRB_WGO', width, height, min.x, min.y, max.x, max.y, wegbaan).then(function(map) {
  				var canvas = new Canvas(map.imageData, '1px solid #000000');
  				var wegbaan = map.object
  				canvas.id = 'Wegopdeling' + wegbaan.id;
  				//canvas.style.display = 'none';
  				document.body.appendChild(canvas);
				});
				WMS.getMap('GRB_WVB', width, height, min.x, min.y, max.x, max.y, wegbaan).then(function(map) {
					var canvas = new Canvas(map.imageData, '1px solid #000000');
  				var wegbaan = map.object
  				canvas.id = 'Wegverbinding' + wegbaan.id;
  				//canvas.style.display = 'none';
  				document.body.appendChild(canvas);
				});
  			//console.log(document.body.getElementsByTagName('canvas').length);
  			var canvas = document.getElementById(wegbaan.id.toString());
  			//console.log(canvas);
  			if (wegbaan.type === 'kruispuntzone') {
  				//console.log('kruispuntzone');
  				//console.log(wegbaan);
  				kruispuntzone = {
  					wegbaan: wegbaan.id,
  					wegknopen: []
  				};
  				var kruispuntzoneNames = {};
  				for (var wegknoopId in wegbaan.wegknopen) {
  					var wegknoop = $R.wegknopen[wegknoopId];
  					//console.log(wegknoop);
  					var names = {};
  					var wegverbindingen = [];
  					for (var wegverbindingId in wegknoop.wegverbindingen) {
  						var wegverbindingName = wegknoop.wegverbindingen[wegverbindingId];
  						if (wegverbindingName != $R.straatNaam) {
  							names[wegverbindingName] = wegverbindingName;
  							kruispuntzoneNames[wegverbindingName] = wegverbindingName;
  						} else {
  							var wegverbinding = $R.wegverbindingen[wegverbindingId];
  							wegverbindingen.push(wegverbinding);
  						}
  					}
  					var s = [$R.straatNaam];
  					for (var name in names) {
  						s.push(name);
  					}
  					wegknoop.name = s.join(', ');
  					wegknoop.links = {};
  					wegknoop.wegbaan = wegbaan.id;
  					//console.log('\t' + wegknoop.name);
  					for (var wegverbinding of wegverbindingen) {
  						//console.log(wegverbinding)
  						var wegknopen = wegverbinding.wegknopen;
  						for (var linkWegknoopId in wegknopen) {
  							if (linkWegknoopId !== wegknoopId) {
  								//console.log('\t' + linkWegknoopId);
  								var linkWegknoop = $R.wegknopen[linkWegknoopId];
  								var linkWegverbindingen = {};
  								for (var linkWegverbindingId in linkWegknoop.wegverbindingen) {
  									var linkWegverbindingName = linkWegknoop.wegverbindingen[linkWegverbindingId];
  									//if (linkWegverbindingName !== $R.straatNaam) {
  										linkWegverbindingen[linkWegverbindingName] = linkWegverbindingName;
  									//}
  								}
  								var s2 = [];
  								for (var name in linkWegverbindingen) {
  									s2.push(name);
  								}
  								var linkWegknoopName = s2.join(', ');
  								linkWegknoop.name = linkWegknoopName;
  								wegknoop.links[linkWegknoopId] = linkWegknoop;
  								//console.log('\t\t' + linkWegknoopName);
  							}
  						}
  					}
  					kruispuntzone.wegknopen.push(wegknoop);
  				}
  				var s3 = [$R.straatNaam];
					for (var name in kruispuntzoneNames) {
						s3.push(name);
					}
					kruispuntzone.name = s3.join(', ');
					$R.kruispuntzones.push(kruispuntzone);
  			}
  		}
  		//console.log($R.kruispuntzones);
  		for (var kruispuntzone of $R.kruispuntzones) {
				//console.log('kruispuntzone ' + kruispuntzone.name);
				for (var kruispunt of kruispuntzone.wegknopen) {
					var x = (parseFloat(kruispunt.bbox[0]) + parseFloat(kruispunt.bbox[2])) / 2;
					var y = (parseFloat(kruispunt.bbox[1]) + parseFloat(kruispunt.bbox[3])) / 2;
					//console.log('\tkruispunt ' + kruispunt.name + ' ' + new Point(x, y).toString());
					//console.log(kruispunt);
					for (var lnkId in kruispunt.links) {
						var lnk = kruispunt.links[lnkId];
						var linkPoints = [];
						
						var bounds = new Bounds();
						var bbox = kruispunt.bbox;
						bounds.addPoints([new Point(parseFloat(bbox[0]), parseFloat(bbox[1])), new Point(parseFloat(bbox[2]), parseFloat(bbox[3]))]);
						var points = $R.Wegbanen.get(kruispunt.wegbaan).points;
						//console.log(points);
						for (var point of points) {
							linkPoints.push(point);
						}
						var x = (parseFloat(lnk.bbox[0]) + parseFloat(lnk.bbox[2])) / 2;
						var y = (parseFloat(lnk.bbox[1]) + parseFloat(lnk.bbox[3])) / 2;
						//console.log('\t\t==> ' + lnk.name + ' ' + new Point(x, y).toString());
						var bbox = lnk.bbox;
						//console.log(lnk);
						bounds.addPoints([new Point(parseFloat(bbox[0]), parseFloat(bbox[1])), new Point(parseFloat(bbox[2]), parseFloat(bbox[3]))]);
						if (lnk.wegbaan != undefined) {
							var points = $R.Wegbanen.get(lnk.wegbaan).points;
							//console.log(points);
							for (var point of points) {
								linkPoints.push(point);
							}
							var points = {};
							for (var point of linkPoints) {
								var x = (point.bbox[0] + point.bbox[2]) / 2;
								var y = (point.bbox[1] + point.bbox[3]) / 2;
								if (bounds.min.x < x && x < bounds.max.x && bounds.min.y < y && y < bounds.max.y) {
									points[x + ':' + y] = new Point(x, y);
									//console.log(new Point(x, y));
								}
							}
							var pointsList = [];
							for (var pointId in points) {
								pointsList.push('\t\t\t' + points[pointId].toString().replace(',', ',0,-').replace('[', '[0,').replace(']', ', 0xff0000]'));
							}
							lnk.pointsList = pointsList;
							//console.log(pointsList.join('\n'));
						} else {
							console.log(lnk.id);
						}
					}
				}
  		}
  		//console.log('==========');
  	});
  },
  getMaxScale: function(scale, w, h) {
  	var maxScale = Math.floor(Math.min(Math.max($R.MAX_WIDTH / (w * scale), $R.MAX_HEIGHT / (h * scale)), $R.MAX_SCALE));
  	return maxScale;
  },
  getWegbaanBounds: function(bbox, wegbaan, scale) {
		var min = {
			x: bbox[0],
			y: bbox[1]
		};
		var max = {
			x: bbox[2],
			y: bbox[3]
		};
		var width = max.x - min.x;
		var height = max.y - min.y;
		if (scale != 1) {
			var maxScale = $R.getMaxScale($R.MAX_SCALE, width, height);
		} else {
			var maxScale = $R.getMaxScale(1, width, height);
		}
		WMS.getMap('GRB_WBN', width * maxScale, height * maxScale, min.x, min.y, max.x, max.y, wegbaan).then(function(map) {
			var wegbaan = map.object;
			var imageData = map.imageData;
			var canvas = document.createElement('canvas');
			var width = imageData.width;
			var height = imageData.height;
			var bbox = map.parameters.bbox.split(',');
			var left = parseInt(bbox[0]);
			var right = parseInt(bbox[2]);
			var top = parseInt(bbox[1]);
			var bottom = parseInt(bbox[3]);
			bbox = wegbaan.bbox();
			var scaleX = width / (right - left);
			var scaleY = height / (bottom - top);
			var scale = (scaleX + scaleY) / 2;
			var maxScale = $R.getMaxScale(scale, width, height);
			canvas.width = width;
			canvas.height = height;
			var context = canvas.getContext('2d');
			context.putImageData(imageData, 0, 0);
			context.strokeStyle = '#000000';
			var filled = null;
			for (var i = 0; i < wegbaan.points.length; i++) {
				var point = wegbaan.points[i];
				var left = parseInt(point.bbox[0] - bbox[0]) * scaleX;
				var top = parseInt(point.bbox[1] - bbox[1]) * scaleY;
				var right = -parseInt(point.bbox[2] - bbox[2]) * scaleX;
				var bottom = -parseInt(point.bbox[3] - bbox[3]) * scaleY;
				var w = width - (left + right);
				var h = height - (top + bottom);
				var x = left + w;
				var y = 1 + height - (top + h);
				imageData = context.getImageData(0, 0, width, height);
				data = imageData.data;
				var offset = (x + y * width) * 4;
				var r = data[offset];
				var g = data[offset + 1];
				var b = data[offset + 2];
				var a = data[offset + 3];
				var color = r << 16 | g << 8 | b;
				var wegbaanColor = Wegbaan.COLOR[wegbaan.type];
				if (a != 0x00) {
					if (color !== wegbaanColor.fill) {
						var foundColor = $R.findColor(imageData, x, y, wegbaanColor.find, 3 * scale, wegbaanColor.fill);
						if (foundColor) {
							if (foundColor.color != wegbaanColor.fill) {
								filled = floodFill(canvas, foundColor.x, foundColor.y, wegbaanColor.flood, 0xff);
							}
						} else {
	  					context.strokeRect(x, y, 1, 1);
						}
  				}
	  		} else {
	  			console.log(a);
	  		}
			}
			if (filled.x > 0 && filled.x + filled.width < width && filled.y > 0 && filled.y + filled.height < height) {
				if (wegbaan.bounds === undefined) {
					wegbaan.bounds = {};
					var cropped = context.getImageData(filled.x, filled.y, filled.width, filled.height);
					var bbox = wegbaan.bbox();
					var maxScale = $R.getMaxScale(5, filled.width, filled.height);
					setTimeout(function() {
						$R.getWegbaanBounds(bbox, wegbaan, maxScale);
					}, 100);
				} else {
					wegbaan.border = {};
					var w = filled.width;
					var h = filled.height;
					var wegopdeling = document.getElementById('Wegopdeling' + wegbaan.id);
					var wegverbinding = document.getElementById('Wegverbinding' + wegbaan.id);
					var ctx = wegopdeling.getContext('2d');
					var wegopdelingCropped = ctx.getImageData(filled.x, filled.y, w, h);
					var cropped = context.getImageData(filled.x, filled.y, w, h);
					canvas.width = w;
					canvas.height = h;
					var data = cropped.data;
					var colors = {};
					for (var y = 0; y < h; y++) {
						for (var x = 0; x < w; x++) {
							var offset = (x + y * w) * 4;
							var r = data[offset];
							var g = data[offset + 1];
							var b = data[offset + 2];
							var a = data[offset + 3];
							var color = r << 16 | g << 8 | b;
							if (color !== 0xff0000 && color !== 0x00ff00) {
								data[offset] = 0;
								data[offset + 1] = 0;
								data[offset + 2] = 0;
								data[offset + 3] = 0;
							}
						}
					}
					var wegopdelingImageData = wegopdeling.getContext('2d').getImageData(0, 0, wegopdeling.width, wegopdeling.height);
			    var data = wegopdelingImageData.data;
			    for (var y = 0; y < wegopdeling.height; y++) {
				    for (var x = 0; x < wegopdeling.width; x++) {
				    	var offset = (x + y * wegopdeling.width) * 4;
							var r = data[offset];
							var g = data[offset + 1];
							var b = data[offset + 2];
							var a = data[offset + 3];
							var color = r << 16 | g << 8 | b;
							switch (color) {
								case 0xffd700:
								case 0xfdd500:
								case 0xfdd400:
								case 0xfcd400:
								case 0xfbd400:
								case 0xfbd200:
								case 0xfad400:
									data[offset] = 0;
									data[offset + 1] = 0;
									data[offset + 2] = 0;
									data[offset + 3] = 0;
									break;
								default:
									if (a === 0x00 || b < 3) {
										data[offset] = 0;
										data[offset + 1] = 0;
										data[offset + 2] = 0;
										data[offset + 3] = 0;
									} else {
										data[offset] = 0;
										data[offset + 1] = 0;
										data[offset + 2] = 0;
										data[offset + 3] = 0xff;
									}
							}
				    }
				  }
				  wegopdeling.getContext('2d').putImageData(wegopdelingImageData, 0, 0);
					context.clearRect(0, 0, w, h);
					context.putImageData(cropped, 0, 0);
					canvas.style.border = '1px solid #000000';
					canvas.id = 'Wegbaan' + wegbaan.id;
					document.body.appendChild(canvas);
					var polygon = Polygon.fromCanvas(canvas, map.parameters.bbox.split(','), width, height, new Point(filled.x, filled.y));
					if (polygon.points.length > 0) {
					/*var result = MarchingSquares.getBlobOutlinePoints(canvas);
					if (result.length > 0) {
						var theBorder = [];
						for (var borderIndex = 0; borderIndex < result.length / 2; borderIndex++) {
							var borderPoint = {
								x: result[borderIndex * 2],
								y: result[borderIndex * 2 + 1]
							};
							theBorder.push(borderPoint);
						}
						var corners = simplify(theBorder, 2, true);
						var polygon = [];
				    var corner = null;//corners[0];
				    var bbox = map.parameters.bbox.split(',');
						var left = parseInt(bbox[0]);
						var right = parseInt(bbox[2]);
						var top = parseInt(bbox[1]);
						var bottom = parseInt(bbox[3]);
				    for (var k = 0; k < corners.length; k++) {
				      corner = corners[k];
				      var xPos = (left + ((corner.x + filled.x) / width) * (right - left)).toFixed(2);
				      var yPos = (bottom - ((corner.y + filled.y) / height) * (bottom - top)).toFixed(2);
					    polygon.push('[' + xPos + ',' + yPos + ']');
				    }
				    $R.polygons.push("addComplexBaan(" + wegbaan.id + ", '" + (wegbaan.type) + "', [" + polygon.join(',') + "]);");*/
				    $R.polygons.push("addComplexBaan(" + wegbaan.id + ", '" + (wegbaan.type) + "', " + polygon.toFixed(2) + ");");
				    //console.log('Wegopdeling ' + [wegopdeling.width, wegopdeling.height].join('x'));
				    //console.log('Wegbaan ' + [canvas.width, canvas.height].join(','));
				    //console.log([filled.x, filled.y].join(','));
				    var imageDataRed = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
				    context.drawImage(wegopdeling, -filled.x, -filled.y);
				    if (wegverbinding != null) {
				    	var width = wegverbinding.width;
				    	var height = wegverbinding.height;
				    	var imageData = wegverbinding.getContext('2d').getImageData(0, 0, width, height);
				    	var imageData2 = canvas.getContext('2d').getImageData(filled.x, filled.y, width, height);
				    	var data = imageData.data;
				    	var data2 = imageDataRed.data;
				    	var colors2 = {};
				    	for (var y = 0; y < height; y++) {
								for (var x = 0; x < width; x++) {
									var offset = (x + y * width) * 4;
									var r = data[offset];
									var g = data[offset + 1];
									var b = data[offset + 2];
									var a = data[offset + 3];
									var color = r << 16 | g << 8 | b;
									if (color === 0xe6e6e6) {
										data[offset] = 0x00;
										data[offset + 1] = 0x00;
										data[offset + 2] = 0x00;
										data[offset + 3] = 0xff;
										var r2 = data2[offset];
										var g2 = data2[offset + 1];
										var b2 = data2[offset + 2];
										var a2 = data2[offset + 3];
										var color2 = (r2 << 16 | g2 << 8 | b2).toString(16);
										if (colors2[color2] === undefined) {
											colors2[color2] = 0;
										}
										colors2[color2]++;
									} else {
										data[offset] = 0;
										data[offset + 1] = 0;
										data[offset + 2] = 0;
										data[offset + 3] = 0;
									}
								}
							}
							var wegverbindingContext = wegverbinding.getContext('2d');
							imageData.removeColor(0xe6e6e6);
							wegverbindingContext.drawImage(new Canvas(imageData), 0, 0);
							var d = imageDataRed.data;
							for (var y = 0; y < canvas.height; y++) {
								for (var x = 0; x < canvas.width; x++) {
									var offset  = (x + y * canvas.width) * 4;
									var r = d[offset];
									var g = d[offset + 1];
									var b = d[offset + 2];
									var a = d[offset + 3];
									var color = (r << 16 | g << 8 | b);
									if (color === 0xff0000 || color === 0x00ff00) {
										d[offset] = 0;
										d[offset + 1] = 0;
										d[offset + 2] = 0;
										d[offset + 3] = 0;
									} else {
										d[offset] = 0xff;
										d[offset + 1] = 0xff;
										d[offset + 2] = 0xff;
										d[offset + 3] = 0xff;
									}
								}
							}
							canvas.getContext('2d').drawImage(new Canvas(imageDataRed), 0, 0);
							var min = {
								x: Math.min(wegbaan._bbox[0], wegbaan._bbox[2]),
								y: Math.min(wegbaan._bbox[1], wegbaan._bbox[3])
							};
							var max = {
								x: Math.max(wegbaan._bbox[0], wegbaan._bbox[2]),
								y: Math.max(wegbaan._bbox[1], wegbaan._bbox[3])
							};
							var bbox = wegbaan.bbox();
							var width = Math.abs(max.x - min.x);
							var height = Math.abs(max.y - min.y);
							for (var point of wegbaan.points) {
								var center = {
									x: (point.bbox[0] + point.bbox[2]) / 2,
									y: (point.bbox[1] + point.bbox[3]) / 2
								};
								if (min.x < center.x && center.x < max.x && min.y < center.y && center.y < max.y) {
									var x = parseInt(center.x - min.x);
									var y = height - parseInt(max.y - center.y);
									context.fillStyle = '#0000ff';									
								}
							}
							for (var wegknoopId in wegbaan.wegknopen) {
								var wegknoop = $R.wegknopen[wegknoopId];
								var min = {
									x: Math.min(wegbaan._bbox[0], wegbaan._bbox[2]),
									y: Math.min(wegbaan._bbox[1], wegbaan._bbox[3])
								};
								var max = {
									x: Math.max(wegbaan._bbox[0], wegbaan._bbox[2]),
									y: Math.max(wegbaan._bbox[1], wegbaan._bbox[3])
								};
								var center = {
									x: (point.bbox[0] + point.bbox[2]) / 2,
									y: (point.bbox[1] + point.bbox[3]) / 2
								};
								var width = max.x - min.x;
								var height = max.y - min.y;
								if (min.x < center.x && center.x < max.x && min.y < center.y && center.y < max.y) {
									var x = parseInt(center.x - min.x);
									var y = parseInt(max.y - center.y);
								}
							}
							var wb = document.getElementById('Wegbaan' + wegbaan.id);
							var width = wb.width;
							var height = wb.height;
				    	var wvb = wegverbinding.getContext('2d').getImageData(filled.x, filled.y, width, height);
				    	var c = new Canvas(wvb, '1px solid #000000');
				    	c.id = 'Wegknopen' + wegbaan.id;
				    	document.body.appendChild(c);
				    	//c.style.display = 'none';
				    	var wegknopen = c.getContext('2d').getImageData(0, 0, c.width, c.height);
				    	var wbImage = wb.getContext('2d').getImageData(0, 0, c.width, c.height);
				    	var data = wegknopen.data;
				    	var wbdata = wbImage.data;
				    	for (var y = 0; y < c.height; y++) {
				    		for (var x = 0; x < c.width; x++) {
				    			var offset = (x + y * c.width) * 4;
				    			var r = data[offset];
									var g = data[offset + 1];
									var b = data[offset + 2];
									var a = data[offset + 3];
									var color = r << 16 | g << 8 | b;
									if (color === 0x000000 && a > 0) {
										var r2 = wbdata[offset];
										var g2 = wbdata[offset + 1];
										var b2 = wbdata[offset + 2];
										var a2 = wbdata[offset + 3];
										var color2 = r2 << 16 | g2 << 8 | b2;
										if (color2 === 0xff0000) {
											data[offset] = 0xff;
											data[offset + 1] = 0x00;
											data[offset + 2] = 0x00;
											data[offset + 3] = 0xff;
										}
									}
				    		}
				    	}
				    	var ff = floodFill(canvas, parseInt(c.width / 2), parseInt(c.height / 2), 0x666666ff, 0xff);
				    	ff.image.removeColor(0xff0000);
				    	ff.image.removeColor(0x00ff00);
				    	var ffCanvas = new Canvas(ff.image, '1px solid #000000');
				    	document.body.appendChild(ffCanvas);
				    	/*var result = MarchingSquares.getBlobOutlinePoints(ffCanvas);
				    	if (result.length > 0) {
								var theBorder = [];
								for (var borderIndex = 0; borderIndex < result.length / 2; borderIndex++) {
									var borderPoint = {
										x: result[borderIndex * 2],
										y: result[borderIndex * 2 + 1]
									};
									theBorder.push(borderPoint);
								}
								var corners = simplify(theBorder, 2, true);
								var polygon = [];
						    var corner = null;
								var left = parseInt(bbox[0]);
								var right = parseInt(bbox[2]);
								var top = parseInt(bbox[1]);
								var bottom = parseInt(bbox[3]);
								var thePolygon = new Polygon();
						    for (var k = 0; k < corners.length; k++) {
						      corner = corners[k];
						      var xPos = (left + ((corner.x + filled.x) / map.imageData.width) * (right - left));
				      		var yPos = (bottom - ((corner.y + filled.y) / map.imageData.height) * (bottom - top));
							    polygon.push('[' + xPos.toFixed(2) + ',' + yPos.toFixed(2) + ']');
							    thePolygon.points.push(new Point(xPos, yPos));
						    }
						    //console.log(thePolygon.toFixed(2));
						    //console.log(polygon.join(','));
						    $R.polygonsBaan.push("addComplexBaan(" + wegbaan.id + ", '" + (wegbaan.type + 'Baan') + "', [" + polygon.join(',') + "]);");
						  }*/
						  var polygon = Polygon.fromCanvas(ffCanvas, bbox, map.imageData.width, map.imageData.height, new Point(filled.x, filled.y));
						  $R.polygonsBaan.push("addComplexBaan(" + wegbaan.id + ", '" + (wegbaan.type + 'Baan') + "', " + polygon.toFixed(2) + ");");
				    }
				    var x = w / 2;
				    var y = h / 2;
				    //console.log([x,y].join(','));
				    var imageData = context.getImageData(0, 0, w, h);
				    var data = imageData.data;
				    imageData.removeColor(0);
				    imageData.removeColor(0xffffff);
				    for (var y = 0; y < height; y++) {
							for (var x = 0; x < width; x++) {
								var offset = (x + y * width) * 4;
								var r = data[offset];
								var g = data[offset + 1];
								var b = data[offset + 2];
								var a = data[offset + 3];
								var color = r << 16 | g << 8 | b;
								if (color != 0xff0000 && a !== 0xff) {
									data[offset] = 0;
									data[offset + 1] = 0;
									data[offset + 2] = 0;
									data[offset + 3] = 0;
								}
							}
						}
				    context.putImageData(imageData, 0, 0);
				    //canvas.style.backgroundColor = '#cccccc';
				    //console.log(imageData);
				    //imageData.showColors();
				    //var color = $R.getColor(imageData, x, y);
				    //console.log(color.toString(16));
				    //var f = floodFill(canvas, x, y, 0xff00ff, 0x00);
				    //console.log(f);

				    //console.log([wegbaan.id, wegbaan.type]);
				    //wegopdeling.style.display = '';
				    
				    
					}
				}
			} else {
				//console.log(['--', wegbaan.id, scale, width, height]);
				var maxScale = $R.getMaxScale($R.MAX_SCALE, width, height);
				//console.log(['MAX_SCALE', maxScale, scale === maxScale, scale, maxScale]);
				/*bbox[0] *= maxScale / scale;
				bbox[1] *= maxScale / scale;
				bbox[2] *= maxScale / scale;
				bbox[3] *= maxScale / scale;*/
				var bbox = wegbaan._bbox;
				if (filled.x == 0) {
					bbox[0] -= width * maxScale / scale;
				}
				if (filled.y == 0) {
					bbox[3] += height * maxScale / scale;
				}
				if (filled.x + filled.width == width) {
					bbox[2] += width * maxScale / scale;
				}
				if (filled.y + filled.height == height) {
					bbox[1] -= height * maxScale / scale;
				}
				var w = bbox[2] - bbox[0];
				var h = bbox[3] - bbox[1];
				//var maxScale = Math.floor(Math.min(Math.max($R.MAX_WIDTH / (w * scale), $R.MAX_HEIGHT / (h * scale)), $R.MAX_SCALE));
				//console.log(['adjust', wegbaan.id, width, height, maxScale]);
				$R.getWegbaanBounds(bbox, wegbaan, maxScale);
			}
		});
	},
  getColor: function(imageData, x, y) {
  	var data = imageData.data;
  	var width = imageData.width;
		var offset = (x + y * width) * 4;
		var r = data[offset];
		var g = data[offset + 1];
		var b = data[offset + 2];
		var a = data[offset + 3];
		var color = r << 16 | g << 8 | b;	  					
		return color;
	},
	findColor: function(imageData, x, y, color, range, color2) {
		var colors = {};
		for (var i = x - range; i < x + range; i++) {
			for (var j = y - range; j < y + range; j++) {
				var foundColor = $R.getColor(imageData, i, j);
				if (foundColor == color || foundColor == color2) {
					return {
						x: i,
						y: j,
						color: foundColor
					};
				} else {
					colors['#' + foundColor.toString(16)] = true;
				}
			}
		}
		var foundColors = [];
		for (var foundColor in colors) {
			foundColors.push(foundColor);
		}
		console.log(foundColors.join('\n'));
		return null;
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
				gebouw.huisnummer = $R.huisNummers[0].Huisnummer;
				var size = 10;
				gebouw.polygon = Polygon.fromWKT(gebouw.Geometrie);
				var bounds = gebouw.polygon.bounds();
				bounds.round();
				bounds.expand(1);
			  gebouw.width = bounds.width() * size;
			  gebouw.height = bounds.height() * size;
			  gebouw.min = bounds.min;
			  gebouw.max = bounds.max;
			  if (false) WMS.getMap('DHMVII_DSM_1m', gebouw.width, gebouw.height, gebouw.min.x, gebouw.min.y, gebouw.max.x, gebouw.max.y, gebouw).then(function(map) {
			  	var gebouw = map.object;
			  	var imageData = map.imageData;
			  	var canvas = new Canvas(imageData, '1px solid #000000');
			  	canvas.title = $R.straatNaam + ' ' + gebouw.huisnummer;
			  	document.body.appendChild(canvas);
				  WMS.getMap('GRB_GBG', gebouw.width, gebouw.height, gebouw.min.x, gebouw.min.y, gebouw.max.x, gebouw.max.y, [canvas, gebouw]).then(function(map) {
				  	var canvas = map.object[0];
				  	var gebouw = map.object[1];
				  	var context = canvas.getContext('2d');
				  	/*var imageData = map.imageData;
				  	imageData.removeColor(0xfa7d69);
				  	imageData.removeColor(0xfa9b87);
				  	context.drawImage(new Canvas(imageData), 0, 0);*/
				  	var polygon = gebouw.polygon;
				  	var bounds = polygon.bounds();
				  	var minX = bounds.min.x;
				  	var maxY = bounds.max.y;
				  	var size = 10;
				  	var left = parseInt((minX - gebouw.min.x) * size);
				  	var top = parseInt((gebouw.max.y - maxY) * size);
				  	var border = [[0, 0], [gebouw.width, 0], [gebouw.width, gebouw.height], [0, gebouw.height]];
				  	var hole = [];
				  	for (var point of polygon.points) {
				  		hole.push([left + parseInt((point.x - minX) * size), top + parseInt(-(point.y - maxY) * size)]);
				  	}
				  	context.drawPolygon(border, [hole]);
				  	var width = canvas.width;
				  	var height = canvas.height;
				  	var imageData = context.getImageData(0, 0, width, height);
				  	imageData.removeColor(0xffffff);
				  	var data = imageData.data;
				  	var rmin = Infinity;
				  	var rmax = -Infinity;
				  	var gmin = Infinity;
				  	var gmax = -Infinity;
				  	var bmin = Infinity;
				  	var bmax = -Infinity;
				  	var min = Infinity;
				  	var max = -Infinity;
				  	var data32 = new Float32Array/*Uint32Array*/(data.buffer);
				  	var dataView = new DataView(data.buffer);
				  	//console.log(dataView);
				  	for (var x = 0; x < width; x++) {
				  		for (var y = 0; y < height; y++) {
				  			var offset = (x + y * width);
				  			var value = data32[offset];
				  			//var value = dataView.getFloat32(offset, false);
				  			/*var r = data[offset];
				  			var g = data[offset + 1];
				  			var b = data[offset + 2];
				  			var a = data[offset + 3];
				  			if (a != 0) {
					  			rmin = Math.min(r, rmin);
					  			rmax = Math.max(r, rmax);
					  			gmin = Math.min(g, gmin);
					  			gmax = Math.max(g, gmax);
					  			bmin = Math.min(b, bmin);
					  			bmax = Math.max(b, bmax);
					  		}*/
					  		if (!isNaN(value)) {
					  			min = Math.min(value, min);
					  			max = Math.max(value, max);
					  		}
				  		}
				  	}
				  	//console.log([rmin, rmax, gmin, gmax, bmin, bmax]);
				  	//console.log([min, max]);
				  });
			  });
			  var huis = 'addComplexHuis(' + gebouw.polygon.toFixed(2) + ');';
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
      var wegsegment = this;
      //console.log(wegsegment);
      //console.log(this);
      for (var point of this.line) {
      	//console.log(point);
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
	    	$R.Wegbanen.add();
	    	WMS.getMap('GRB_WKN', width * 10, height * 10, min.x, min.y, max.x, max.y, wegsegment).then(function(wegknoop) {
	    		var imageData = wegknoop.imageData;
	    		var wegsegment = wegknoop.object;
	    		var data = imageData.data;
	    		var width = imageData.width;
	    		var height = imageData.height;
	    		var parameters = wegknoop.parameters;
	    		var bbox = parameters.bbox.split(',');
	    		for (var x = 0; x < width; x++) {
	    			for (var y = 0; y < height; y++) {
	    				var offset = (y * width + x) * 4;
	    				var r = data[offset];
	    				var g = data[offset + 1];
	    				var b = data[offset + 2];
	    				var a = data[offset + 3];
	    				if (a === 0xff) {
	    					WMS.getFeatureInfo('GRB_WKN', width, height, bbox, x, y).then(function(knoop) {
	    						if ($R.wegknopen[knoop.id] === undefined) {
	    							knoop.wegsegment = wegsegment.id;
	    							$R.wegknopen[knoop.id] = knoop;

	    							//console.log([wegsegment, knoop]);
	    							//console.log(knoop);
	    						}
	    						WMS.getFeatureInfo('GRB_WVB', width, height, bbox, x, y).then(function(wegverbindingen) {
	    							for (var wegverbinding of wegverbindingen) {
	    								if ($R.wegverbindingen[wegverbinding.id] === undefined) {
	    									$R.wegverbindingen[wegverbinding.id] = wegverbinding;
	    									//console.log(wegverbinding);
	    								}
	    								$R.wegverbindingen[wegverbinding.id].wegknopen[knoop.id] = knoop.id;
	    								$R.wegknopen[knoop.id].wegverbindingen[wegverbinding.id] = wegverbinding.straatnaam;
	    							}
	    						});
	    						WMS.getFeatureInfo('GRB_WBN', width, height, bbox, x, y).then(function(wegbaan) {
	    							wegbaan = $R.Wegbanen.add(wegbaan);
	    							wegbaan.wegknopen[knoop.id] = knoop.id;
	    						}).catch(function(wegbaan) {
	    							$R.Wegbanen.remove();
	    						});
	    					});
	    					return;
	    				}
	    			}
	    		}
	    		WMS.getFeatureInfo('GRB_WBN', width, height, bbox, x, y).then(function(wegbaan) {
	    			wegbaan = $R.Wegbanen.add(wegbaan);
	    			wegbaan.wegknopen[knoop.id] = knoop.id;
	    		}).catch(function() {
						$R.Wegbanen.remove();
					});
	    	});
      }
      $R.gml.push(GML.line(this.line));
      if ($R.straat.wegsegmentenCount == $R.straat.wegsegmentenLoaded) {
        $R.gml.push(GML.END);
        //console.log($R.gml.join('\n'));
        listHuisnummers();
      }
    };
    var listHuisnummers = function() {
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
    };
		var wegobjectLoaded = function() {
			//console.log(this);
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