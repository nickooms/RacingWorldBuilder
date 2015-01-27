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
    Racing.vecLayer = Racing.layerByName('Vector');
  },
  pixel: function(data, imageWidth, x, y) {
    var offset = ((imageWidth * y) + x) * 4;
    var red = data[offset];
    var green = data[offset + 1];
    var blue = data[offset + 2];
    var alpha = data[offset + 3];
    var color = red + ' ' + green + ' ' + blue + ' ' + alpha;
    return color;
  },
  colorNumber: function(data, imageWidth, x, y) {
    var offset = ((imageWidth * y) + x) * 4;
    var red = data[offset];
    var green = data[offset + 1];
    var blue = data[offset + 2];
    var alpha = data[offset + 3];
    return (red * 256 * 256 * 256) + (green * 256 * 256) + (blue * 256) + alpha;
  },
  colorHex: function(data, imageWidth, x, y) {
    var offset = ((imageWidth * y) + x) * 4;
    var red = data[offset];
    var green = data[offset + 1];
    var blue = data[offset + 2];
    var alpha = data[offset + 3];
    return '0x' + ((red * 256 * 256 * 256) + (green * 256 * 256) + (blue * 256) + alpha).toString(16).toUpperCase();
  },
  plotCorners: function(corners, ctx) {
    var w = ctx.canvas.width,
      h = ctx.canvas.height,
      twopi = 2 * Math.PI,
      step, i, points = [];
    ctx.fillStyle = '#ff0000';
    for (var y = 0; y < h; y++) {
      step = y * w;
      for (var x = 0; x < w; x++) {
        i = step + x;
        if (corners[i] > 0) {
          ctx.beginPath();
          ctx.arc(x, y, 2, twopi, false);
          ctx.closePath();
          ctx.fill();
          points.push({
            x: x,
            y: y
          });
        }
      }
    }
    return points;
  },
  removeLines: function() {
    Racing.vecLayer.removeFeatures(Racing.vecLayer.features);
  },
  activateLayerByName: function(name) {
    var spans = document.getElementsByTagName('span');
    for (var i = 0; i < spans.length; i++) {
      var span = spans[i];
      if (span.innerHTML == name) {
        Ext.get(span).parent().prev().dom.click();
      }
    }
  },
  showGemeente: function(gemeenteNaam, straatNaam, layer, layerName, k, zoomToScale, straatLine, straatLinePoint, layers, layerNames) {
    document.getElementsByClassName('x-tool-collapse-west')[0].click();
    Racing.gemeenteNaam = gemeenteNaam;
    Racing.straatNaam = straatNaam;
    Racing.layerToActivate = layer;
    Racing.layerToActivateName = layerName;
    Racing.layersToActivate = layers;
    Racing.layersToActivateName = layerNames;
    Racing.k = k;
    Racing.zoomToScale = zoomToScale;
    Racing.straatLine = straatLine;
    Racing.straatLinePoint = straatLinePoint.indexOf('-') != -1 ? straatLinePoint : parseInt(straatLinePoint);
    Racing.log('Activate Layer: Geen achtergrondlaag');
    Racing.activateLayerByName(Racing.layerToActivate == 'ortho' ? 'Luchtfoto' : 'Geen achtergrondlaag');
    Racing.removeLines();
    var searchpanelCrab = document.getElementById('searchpanelCrab');
    var searchpanelCrabForm = searchpanelCrab.querySelectorAll('form')[0];
    var inputFields = searchpanelCrabForm.querySelectorAll('input');
    Racing.ddGemeente = Ext.getCmp(inputFields[0].id);
    Racing.gemeenteStore = Racing.ddGemeente.store;
    Racing.ddStraat = Ext.getCmp(inputFields[1].id);
    Racing.straatStore = Racing.ddStraat.store;
    Racing.chkZoom = Ext.getCmp(inputFields[3].id);
    if (Racing.straatNaam == null) {
      Racing.chkZoom.setValue(true);
    } else {
      Racing.straatStore.addListener('load', Racing.showStraat, Racing, {
        single: true
      });
    }
    var gemeenteId = Racing.gemeenteStore.data.keys[Racing.gemeenteStore.find('GemeenteNaam', Racing.gemeenteNaam)];
    Racing.ddGemeente.selectedIndex = Racing.gemeenteStore.find('GemeenteId', gemeenteId);
    Racing.ddGemeente.setValue(gemeenteId).fireEvent('select', Racing.ddGemeente);
    Racing.ddGemeente.fireEvent('change', Racing.ddGemeente, gemeenteId);
  },
  showStraat: function() {
    Racing.log('Zoom in op straat');
    Racing.chkZoom.setValue(true);
    var straatId = Racing.straatStore.data.keys[Racing.straatStore.find('Straatnaam', Racing.straatNaam)];
    Racing.ddStraat.selectedIndex = Racing.straatStore.find('StraatnaamId', straatId);
    Racing.ddStraat.setValue(straatId).fireEvent('select', Racing.ddStraat);
    Racing.ddStraat.fireEvent('change', Racing.ddStraat, straatId);
    viewLocationButton.handler();
    setTimeout(Racing.exportVectorLayer, 0);
  },
  addLayersByName: function(names) {
    for (var i = 0; i < names.length; i++) {
      Racing.addLayerByName(names[i]);
    }
  },
  addLayerByName: function(name) {
    for (var i = 0; i < wmsCapStore.data.length; i++) {
      if (wmsCapStore.data.items[i].data.name == name) {
        wmsGrid.getSelectionModel().selectRow(i);
        AddWMSLayerToMap(wmsGrid.getSelectionModel());
        return;
      }
    }
  },
  layerByName: function(name) {
    return map.layers.filter(function(layer) {
      return layer.name == name ? layer : null
    })[0];
  },
  exportVectorLayer: function() {
    var features = Racing.vecLayer.features;
    if (features.length == 0) {
      setTimeout(Racing.exportVectorLayer, 0);
    } else {
      Racing.log('Exporteer Straat Vector Layer');
      var fc = {
        gemeenteNaam: Racing.gemeenteNaam,
        straatNaam: Racing.straatNaam,
        bounds: {
          minX: null,
          minY: null,
          maxX: null,
          maxY: null
        },
        lines: []
      }
      var bounds = fc.bounds;
      for (var i = 0; i < features.length; i++) {
        var b = features[i].geometry.bounds;
        bounds.minX = bounds.minX ? Math.min(bounds.minX, b.left) : b.left;
        bounds.maxX = bounds.maxX ? Math.max(bounds.maxX, b.right) : b.right;
        bounds.minY = bounds.minY ? Math.min(bounds.minY, b.bottom) : b.bottom;
        bounds.maxY = bounds.maxY ? Math.max(bounds.maxY, b.top) : b.top;
      }
      var uniquePoints = {};
      var linesLog = [];
      //console.log(features.length);
      for (var i = 0; i < features.length; i++) {
        var g = features[i].geometry;
        var lines = [];
        linesLog.push(g.components.length);
        for (var j = 0; j < g.components.length; j++) {
          var c = g.components[j];
          var line = {
            x: c.x,
            y: c.y
          };
          lines.push(line);
          uniquePoints[c.x + ',' + c.y] = line;
        }
        fc.lines.push(lines);
      }
      var points = [];
      for (var i in uniquePoints) {
        points.push(uniquePoints[i]);
      }
      points.sort(function(a, b) {
        return a.x < b.x ? -1 : 1;
      });
      console.log('===========================================================================');
      for (var i = 0; i < fc.lines.length; i++) {
        for (var j = 0; j < fc.lines[i].length; j++) {
          for (var k = 0; k < points.length; k++) {
            if (fc.lines[i][j].x == points[k].x && fc.lines[i][j].y == points[k].y) {
              fc.lines[i][j].point = k;
            }
          }
        }
      }
      cachedStraat = window.localStorage.getItem('straat:' + Racing.straatNaam);
      window.localStorage.setItem('straat:' + Racing.straatNaam, JSON.stringify(fc));
      var pointsData = points.map(function(point) {
        return {
          x: point.x,
          y: point.y
        };
      })
      var linesData = fc.lines.map(function(line) {
        return line.map(function(l) {
          return l.point;
        });
      });
      var totalDist = 0;
      var extraPoints = [];
      var extraLines = [];
      for (var i = 0; i < linesData.length; i++) {
        console.log('Line ' + (i + 1) + '/' + linesData.length);
        var lineData = linesData[i];
        console.log('Line = ' + JSON.stringify(lineData));
        var linePiece = [];
        for (var j = 0; j < lineData.length - 1; j++) {
          console.log('LinePiece ' + (j + 1) + '/' + (lineData.length - 1));
          var point1 = pointsData[lineData[j]];
          var point2 = pointsData[lineData[j + 1]];
          var x1 = point1.x;
          var y1 = point1.y;
          var x2 = point2.x;
          var y2 = point2.y;
          var x = x2 - x1;
          var y = y2 - y1;
          var dist = Math.sqrt(x * x + y * y);
          console.log('Distance = ' + dist);
          var nrExtraPoints = Math.floor(dist / 10);
          console.log('Extra points: ' + nrExtraPoints);
          linePiece.push(lineData[j]);
          if (nrExtraPoints > 0) {
            //var extraLine = [extraPoints.length];
            for (var k = 0; k < nrExtraPoints; k++) {
              var extraPoint = {
                x: point1.x + (k + 1) * x / (nrExtraPoints + 1),
                y: point1.y + (k + 1) * y / (nrExtraPoints + 1)
              };
              linePiece.push(pointsData.length);
              pointsData.push(extraPoint);
              //extraLine.push(linesData.length + extraPoints.length);
              //extraPoints.push(extraPoint);
              /*if (j != 0) {
                var lineData = [pointsData.length - 1, pointsData.length];
              } else {
                lineData[1] = pointsData.length;
              }*/
              //pointsData.push(pointData);
              //linesData.push(lineData);
              //console.log(pointData);
            }
            //extraLines.push(extraLine);
          }
        }
        linePiece.push(lineData[lineData.length - 1]);
        linesData[i] = linePiece;
        console.log('LinePiece = ' + JSON.stringify(linePiece));
        //extraLines.push(lineData);
        //console.log(JSON.stringify(extraLines));
        //console.log(JSON.stringify(extraPoints));
        //totalDist += dist;
      }
      pointsData.forEach(function(point) {
        console.log(JSON.stringify(point));
      });
      /*var totalPoints = [];
      var totalLines = [];
      for (var i = 0; i < pointsData.length; i++) {
        totalPoints.push(pointsData[i]);
      }
      for (var i = 0; i < extraPoints.length; i++) {
        totalPoints.push(extraPoints[i]); 
      }
      for (var i = 0; i < linesData.length; i++) {
        totalLines.push(linesData[i]);
      }
      for (var i = 0; i < extraLines.length; i++) {
        totalLines.push(extraLines[i]); 
      }*/
      //console.log(totalDist);
      //console.log('LINES: ' + JSON.stringify(linesData));
      chrome.runtime.sendMessage(Racing.APP_ID, {
        url: Racing.gemeenteNaam + ':' + Racing.straatNaam + ':points.json',
        json: pointsData
      }, function(response) { 
        //console.log('response: ' + response);
      });
      chrome.runtime.sendMessage(Racing.APP_ID, {
        url: Racing.gemeenteNaam + ':' + Racing.straatNaam + ':lines.json',
        json: linesData
      }, function(response) { 
        //console.log('response: ' + response);
      });
      //console.log(totalLines);
      //console.log(totalPoints);
      Racing.log('Straat: ' + features.length + ' Lines (' + linesLog.join(', ') + ' Points)');
      Racing.points = points;
      Racing.pointsData = pointsData;
      Racing.straat = fc;
      Racing.straatPunt = 0;
      console.log('===========================================================================');
      showCapabilitiesGrid();
    }
  },
  addLayers: function() {
    Racing.log('Adding Layer: ' + Racing.layerToActivate);
    Racing.timer();
    Racing.addLayersByName(Racing.layersToActivate);
    wmsWin.close();
    Racing.layerNames = map.layers.map(function(index, item) {
      return index.name
    }).reverse();
    Racing.log('Added Layer: ' + Racing.layerToActivate);
    Racing.log('Zooming To Scale: ' + Racing.zoomToScale);
    Racing.timer();
    Racing.log('Zoomed To Scale: ' + Racing.zoomToScale);
    var bounds = new OpenLayers.Bounds();
    var straatLinePoint = Racing.points[Racing.straatPunt];
    bounds.extend(new OpenLayers.LonLat(straatLinePoint.x, straatLinePoint.y));
    bounds.extend(new OpenLayers.LonLat(straatLinePoint.x, straatLinePoint.y));
    /*if (typeof Racing.straatLinePoint == 'string') {
      var straatLinePoint1 = Racing.straat.lines[Racing.straatLine][parseInt(Racing.straatLinePoint.split('-')[0])];
      var straatLinePoint2 = Racing.straat.lines[Racing.straatLine][parseInt(Racing.straatLinePoint.split('-')[1])];
      bounds.extend(new OpenLayers.LonLat(straatLinePoint1.x, straatLinePoint1.y));
      bounds.extend(new OpenLayers.LonLat(straatLinePoint2.x, straatLinePoint2.y));
    } else {
      var straatLinePoint = Racing.straat.lines[Racing.straatLine][Racing.straatLinePoint];
      bounds.extend(new OpenLayers.LonLat(straatLinePoint.x, straatLinePoint.y));
      bounds.extend(new OpenLayers.LonLat(straatLinePoint.x, straatLinePoint.y));
    }*/
    map.zoomToExtent(bounds, true);
    Racing.activeLayer = Racing.layerByName(Racing.layerToActivate);
    Racing.log('Start Copy Layer ' + Racing.layerToActivateName);
    Racing.timer();
    Racing.uniqueCols = {};
    Racing.uniqueRows = {};
    Racing.tiles = [];
    setTimeout(Racing.copyLayer, 0);
  },
  findKnownColors: function(canvas) {
    var canvas = Racing.canvas;
    var context = canvas.getContext('2d');
    var imageWidth = canvas.width;
    var imageHeight = canvas.height;
    var imageData = context.getImageData(0, 0, imageWidth, imageHeight);
    var data = imageData.data;
    var colors = {};
    for (var i = 0, n = data.length; i < n; i += 4) {
      var red = data[i];
      var green = data[i + 1];
      var blue = data[i + 2];
      var alpha = data[i + 3];
      var color = '0x' + ((red * 256 * 256 * 256) + (green * 256 * 256) + (blue * 256) + alpha).toString(16).toUpperCase();
      if (colors[color] == null) {
        colors[color] = 1;
      } else {
        colors[color]++;
      }
      switch (color) {
        case '0x0':
        //WBN
        case '0xCCCCCCFF':
        case '0xB7B7B7FF':
        case '0xFA9B87FF':
        case '0xFA7D69FF':
        //WGO        
        case '0xBF00C8FF':
        case '0xBE00C7FF':
        case '0xFED600FF':
        case '0xFFD700FF':
        case '0x984C00FF':
        case '0x974B00FF':
        //case '0xBF00C8FF':
          color = '0xFFFFFFFF';
          red = green = blue = 255;
          data[i] = data[i + 1] = data[i + 2] = 255;
          alpha = 255;
          data[i + 3] = 255;
          break;
        //case '0xBF00C8FF':
        //  console.log('purple');
        //  break;
        default:
          if (color != '0xFFFFFFFF') {
            color = '0x000000FF'
            red = green = blue = 0;
            data[i] = data[i + 1] = data[i + 2] = 0;
            alpha =  255;
            data[i + 3] = 255;
          }
      }
    }
    //console.log(JSON.stringify(colors).split(',').join('\n'));
    Racing.imageData = imageData;
    Racing.log('Found Known Colors');
    Racing.timer();
    Racing.context.putImageData(Racing.imageData, 0, 0);
    Racing.log('Removed Known Colors');
    Racing.log('Searching Remaining Colors');
    Racing.timer();
    setTimeout(Racing.findRemainingColors, 0);
  },
  findRemainingColors: function() {
    var canvas = Racing.canvas;
    var context = canvas.getContext('2d');
    var imageWidth = canvas.width;
    var imageHeight = canvas.height;
    var imageData = context.getImageData(0, 0, imageWidth, imageHeight);
    var data = imageData.data;
    var colors = {};
    for (var i = 0, n = data.length; i < n; i += 4) {
      var red = data[i];
      var green = data[i + 1];
      var blue = data[i + 2];
      var alpha = data[i + 3];
      var color = '0x' + ((red * 256 * 256 * 256) + (green * 256 * 256) + (blue * 256) + alpha).toString(16).toUpperCase();
      if (colors[color] == null) {
        colors[color] = 1;
      } else {
        colors[color]++;
      }
    }
    Racing.colors = colors;
    Racing.log('Found Remaining Colors');
    for (var color in Racing.colors) {
      Racing.log('Found color ' + color + ' : ' + Racing.colors[color] + ' pixels');
    }
    setTimeout(Racing.drawRemainingBlackLines, 0);
  },
  drawRemainingBlackLines: function() {
    var canvas = Racing.canvas;
    var context = canvas.getContext('2d');
    var imageWidth = canvas.width;
    var imageHeight = canvas.height;
    var imageData = context.getImageData(0, 0, imageWidth, imageHeight);
    var data = imageData.data;
    context.fillStyle = '#000000';
    var twopi = 2 * Math.PI;
    for (var y = 0; y < imageHeight; y++) {
      for (var x = 0; x < imageWidth; x++) {
        var offset = ((imageWidth * y) + x) * 4;
        var red = data[offset];
        var green = data[offset + 1];
        var blue = data[offset + 2];
        var alpha = data[offset + 3];
        if (red == 0 && green == 0 && blue == 0 && alpha == 255) {
          context.beginPath();
          context.arc(x, y, 1, twopi, false);
          context.closePath();
          context.fill();
        }
      }
    }
    Racing.log('Searching Corners');
    Racing.timer();
    setTimeout(Racing.findCorners, 0);
  },
  findLines: function() {
    var imageWidth = Racing.canvas.width;
    Racing.data = Racing.imageData.data;
    Racing.l = [];
    Racing.linesFound = [];
    var xi, yi, xj, yj;
    for (var i = 0; i < Racing.points.length; i++) {
      xi = Racing.points[i].x;
      yi = Racing.points[i].y;
      for (var j = 0; j < Racing.points.length; j++) {
        if (i != j) {
          xj = Racing.points[j].x;
          yj = Racing.points[j].y;
          var x = Math.round((xi + xj) / 2);
          var y = Math.round((yi + yj) / 2);
          var lineMiddle = Racing.pixel(Racing.data, imageWidth, x, y);
          if (lineMiddle === '0 0 0 255') {
            var line = xj + ',' + yj + ' ' + xi + ', ' + yi;
            if (Racing.linesFound.indexOf(line) == -1) {
              line = xi + ',' + yi + ' ' + xj + ', ' + yj;
              Racing.linesFound.push(line);
              Racing.l.push({
                from: {
                  x: xi,
                  y: yi
                },
                to: {
                  x: xj,
                  y: yj
                }
              });
            }
          }
        }
      }
    }
    Racing.log('Found ' + Racing.linesFound.length + ' Lines');
    Racing.log('Done');
  },
  findCorners: function() {
    Racing.corners = CornerDetector.detect(Racing.imageData, 'harris', {
      qualityLevel: 0.01,
      blockSize: 5,
      k: parseFloat(Racing.k)
    });
    Racing.points = Racing.plotCorners(Racing.corners, Racing.context);
    Racing.log('Found ' + Racing.points.length + ' Corners');
    setTimeout(Racing.createCircles, 0);
  },
  createCanvas: function() {
    Racing.canvas = document.createElement('canvas');
    document.body.appendChild(Racing.canvas);
    Racing.context = Racing.canvas.getContext('2d');
    Racing.canvas.style.position = 'absolute';
    Racing.canvas.style.left = 0;
    Racing.canvas.style.top = 0;
    Racing.canvas.style.zIndex = 6000;
    Racing.canvas.style.backgroundColor = 'transparent';
  },
  createSVG: function() {
    Racing.svg = document.createElementNS(Racing.SVG, 'svg');
    Racing.svg.setAttribute('width', Racing.canvas.getAttribute('width'));
    Racing.svg.setAttribute('height', Racing.canvas.getAttribute('height'));
    Racing.svg.style.position = 'absolute';
    Racing.svg.style.zIndex = Racing.canvas.style.zIndex + 1;
    document.body.appendChild(Racing.svg);
  },
  createLine: function() {
    var line = document.createElementNS(Racing.SVG, 'line');
    line.setAttribute('x1', Racing.start.x);
    line.setAttribute('y1', Racing.start.y);
    line.setAttribute('x2', Racing.end.x);
    line.setAttribute('y2', Racing.end.y);
    line.setAttribute('stroke', 'red');
    line.setAttribute('stroke-width', 2);
    Racing.svg.appendChild(line);
  },
  createCircles: function() {
    Racing.createSVG();
    Racing.resetPolygon();
    for (var i = 0; i < Racing.points.length; i++) {
      var x = Racing.points[i].x;
      var y = Racing.points[i].y;
      Racing.createCircle(x, y);
    }
    Racing.log('Done');
    //Racing.log('Searching Lines');
    //Racing.timer();
    //setTimeout(Racing.findLines, 0);
  },
  createCircle: function(x, y) {
    var circle = document.createElementNS(Racing.SVG, 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('stroke', 'blue');
    circle.setAttribute('stroke-width', 2);
    circle.setAttribute('fill', 'blue');
    circle.setAttribute('r', 2);
    circle.setAttribute('class', 'circle');
    circle.addEventListener('mouseover', Racing.circleOver);
    circle.addEventListener('mouseout', Racing.circleOut);
    circle.addEventListener('mouseup', Racing.circleUp);
    Racing.svg.appendChild(circle);
  },
  resetPolygon: function() {
    Racing.start = null;
    Racing.end = null;
    Racing.polygons = [];
    Racing.polygon = [];
  },
  circleOver: function(evt) {
    this.setAttribute('stroke-width', 10);
    this.setAttribute('stroke', 'red');
  },
  circleOut: function(evt) {
    this.setAttribute('stroke-width', 2);
    this.setAttribute('stroke', 'blue');
  },
  circleUp: function(evt) {
    this.setAttribute('stroke', 'red');
    var pixels = {
      x: this.getAttribute('cx'),
      y: this.getAttribute('cy')
    };
    var lonlat = map.getLonLatFromPixel({
      x: parseInt(pixels.x),
      y: parseInt(pixels.y)
    });
    Racing.polygon.push([lonlat.lon.toFixed(2), lonlat.lat.toFixed(2)]);
    if (Racing.start == null) {
      Racing.start = pixels;
    } else {
      Racing.end = pixels;
      Racing.createLine();
      Racing.start = Racing.end;
      Racing.checkPolygonClosed();
    }
  },
  checkPolygonClosed: function() {
    var start = Racing.polygon[0];
    var end = Racing.polygon[Racing.polygon.length - 1];
    if (start[0] == end[0] && start[1] == end[1]) {
      Racing.polygon.pop();
      console.log(JSON.stringify(Racing.polygon).replace(/"/g, ''));
      Racing.resetPolygon();
    }
  },
  copyLayer: function(callback) {
    if (Racing.canvas == null) {
      Racing.createCanvas();
    }
    Racing.currentLayer = Racing.layerByName(Racing.layerToActivateName);
    if (Racing.currentLayer.loading) {
      setTimeout(Racing.copyLayer, 0);
    } else {
      var loaded = true;
      var grid = Racing.currentLayer.grid;
      var gridColumns = grid.length;
      for (var x = 0; x < gridColumns; x++) {
        var gridColumn = grid[x];
        var gridRows = gridColumn.length;
        for (var y = 0; y < gridRows; y++) {
          var tile = gridColumn[y];
          if (tile.imgDiv == null) {
            loaded = false;
          }
        }
      }
      if (!loaded) {
        setTimeout(Racing.copyLayer, 0);
        return;
      }
      //Racing.log('Start Copy Layer ' + Racing.layerToActivateName + ' Loaded');
      var position = Racing.currentLayer.div.getBoundingClientRect();
      
      Racing.log('Loading ' + Racing.layerToActivateName + ' (' + grid.length * grid[0].length + ' Tiles)');
      if (Racing.layerToActivate == Racing.layersToActivate[1]) {
        Racing.context.globalCompositeOperation = 'xor';//'source-over';
      } else {
        Racing.context.globalCompositeOperation = 'source-over';
        if (Racing.straatPunt == 0) {
          Racing.canvas.width = 512;//Racing.currentLayer.div.scrollWidth;
          Racing.canvas.height = 512;//Racing.currentLayer.div.scrollHeight;
        }
      }
      Racing.timer();
      var tiles = [];
      for (var x = 0; x < gridColumns; x++) {
        var gridColumn = grid[x];
        var gridRows = gridColumn.length;
        for (var y = 0; y < gridRows; y++) {
          var tile = gridColumn[y];
          //if (Racing.layerToActivate != Racing.layersToActivate[0]) {
            Racing.context.clearRect(0, 0, 512, 512);
          //}
          Racing.context.drawImage(tile.imgDiv, 0/*tile.position.x + position.left*/,0 /*tile.position.y + position.top*/, tile.size.w, tile.size.h);
          if (tile.url.indexOf('ortho') == -1) {
            var name = tile.url.split('LAYERS=')[1].split(/\&EXCEPTIONS|BBOX=/g);
          } else {
            var name = tile.url.split('LAYERS=')[1].split(/\&TRANSPARENT|BBOX=/g);
          }
          tiles.push(tile.url);
          var layer = name[0];
          var fileName = name[0] + ':' + name[2];
          var points = name[2].split('&')[0].split(',');
          //console.log(fileName);
          Racing.tiles.push({
            fileName: fileName,
            points: points
          });
          //console.log(points);
          for (var i = 0; i < Racing.pointsData.length / 2; i++) {
            Racing.uniqueCols[Racing.pointsData[i * 2]] = true;
            Racing.uniqueRows[Racing.pointsData[i * 2 + 1]] = true;
          }
          chrome.runtime.sendMessage(Racing.APP_ID, {
            base64: Racing.canvas.toDataURL('image/png'),
            url: Racing.gemeenteNaam + ':' + Racing.straatNaam + ':' + fileName
          }, function(response) { 
            //console.log('response: ' + response);
          });
        }
      }
      chrome.runtime.sendMessage(Racing.APP_ID, {
        tiles: tiles,
        layer: Racing.layerToActivate,
        url: Racing.gemeenteNaam + ':' + Racing.straatNaam + ':' + Racing.layerToActivate + '#' + Racing.straatPunt + '#' + Racing.pointsData.length + '.point'
      }, function(response) { 
        //console.log('response: ' + response);
      });
      Racing.log('Loaded ' + grid.length * grid[0].length + ' Tiles');
      if (Racing.layersToActivate.length > 1 && Racing.layerToActivate != Racing.layersToActivate[1]) {
        Racing.layerToActivate = Racing.layersToActivate[1];
        Racing.layerToActivateName = Racing.layersToActivateName[1];
        setTimeout(Racing.copyLayer, 0);
        //return;
      }
      if (Racing.straatPunt < Racing.pointsData.length - 1) {
        Racing.straatPunt++;
        Racing.layerToActivate = Racing.layersToActivate[0];
        Racing.layerToActivateName = Racing.layersToActivateName[0];
        Racing.activeLayer = Racing.layerByName(Racing.layerToActivate);
        var bounds = new OpenLayers.Bounds();
        var straatLinePoint = Racing.pointsData[Racing.straatPunt];
        bounds.extend(new OpenLayers.LonLat(straatLinePoint.x, straatLinePoint.y));
        bounds.extend(new OpenLayers.LonLat(straatLinePoint.x, straatLinePoint.y));
        map.zoomToExtent(bounds, true);
        Racing.log('Start Copy Layer ' + Racing.layerToActivateName);
        Racing.timer();
        setTimeout(Racing.copyLayer, 0);
      } else {
        var cols = [];
        var rows = [];
        var sortFloat = function(a, b) {
          return a < b ? -1 : 1
        };
        for (var i in Racing.uniqueCols) {
          cols.push(i);
        }
        for (var i in Racing.uniqueRows) {
          rows.push(i);
        }
        cols.sort(sortFloat);
        rows.sort(sortFloat);
        //console.log(cols);
        //console.log(rows);
        for (var i = 0; i < Racing.tiles.length; i++) {
          for (var j = 0; j < Racing.tiles[i].points.length / 2; j++) {
            for (var k = 0; k < cols.length; k++) {
              if (cols[k] == Racing.tiles[i].points[j * 2]) {
                Racing.tiles[i].points[j * 2] = k;
              }
            }
            for (var k = 0; k < rows.length; k++) {
              if (rows[k] == Racing.tiles[i].points[j * 2 + 1]) {
                Racing.tiles[i].points[j * 2 + 1] = k;
              }
            }
          }
        }
        //console.log(JSON.stringify(Racing.tiles));
        chrome.runtime.sendMessage(Racing.APP_ID, {
          cols: Racing.cols,
          rows: Racing.rows,
          tiles: Racing.tiles,
          layers: Racing.layersToActivate
        }, function(response) {
          alert('done');
          //console.log('response: ' + response);
        });
      }
      /*Racing.log('Searching Known Colors');
      Racing.timer();
      setTimeout(Racing.findKnownColors, 0);*/
    }
  },
  closeMenu: function() {
    Racing.port.postMessage({
      action: 'closeMenu'
    });
  },
  log: function(message) {
    /*Racing.port.postMessage({
      action: 'log',
      message: message + (Racing.timestamp != null ? ' <b>[' + (new Date().getTime() - Racing.timestamp) + ' ms]</b>' : '')
    });*/
    console.log(message);
    Racing.timestamp = null;
  },
  timer: function() {
    Racing.timestamp = new Date().getTime();
  }
}
chrome.runtime.onConnect.addListener(function(port) {
  Racing.port = port;
  port.onMessage.addListener(Racing.onMessage);
});