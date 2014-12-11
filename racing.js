window.Racing = {
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
        Racing.showGemeente(msg.gemeenteNaam, msg.straatNaam, msg.layer, msg.layerName, msg.k, msg.zoomToScale, msg.straatLine, msg.straatLinePoint);
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
    var red = data[((imageWidth * y) + x) * 4];
    var green = data[((imageWidth * y) + x) * 4 + 1];
    var blue = data[((imageWidth * y) + x) * 4 + 2];
    var alpha = data[((imageWidth * y) + x) * 4 + 3];
    var color = red + ' ' + green + ' ' + blue + ' ' + alpha;
    return color;
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
          ctx.arc(x, y, 7, twopi, false);
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
      if (spans[i].innerHTML == name) {
        Ext.get(spans[i]).parent().prev().dom.click();
      }
    }
  },
  showGemeente: function(gemeenteNaam, straatNaam, layer, layerName, k, zoomToScale, straatLine, straatLinePoint) {
    document.getElementsByClassName('x-tool-collapse-west')[0].click();
    Racing.gemeenteNaam = gemeenteNaam;
    Racing.straatNaam = straatNaam;
    Racing.layerToActivate = layer;
    Racing.layerToActivateName = layerName;
    Racing.k = k;
    Racing.zoomToScale = zoomToScale;
    Racing.straatLine = straatLine;
    Racing.straatLinePoint = straatLinePoint;
    Racing.log('Activate Layer: Geen achtergrondlaag');
    Racing.activateLayerByName('Geen achtergrondlaag');
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
          minX: 999999,
          minY: 999999,
          maxX: 0,
          maxY: 0
        },
        lines: []
      }
      var bounds = fc.bounds;
      for (var i = 0; i < features.length; i++) {
        var b = features[i].geometry.bounds;
        bounds.minX = Math.max(bounds.minX, b.left);
        bounds.maxX = Math.min(bounds.maxX, b.right);
        bounds.minY = Math.max(bounds.minY, b.bottom);
        bounds.maxY = Math.min(bounds.maxY, b.top);
      }
      var linesLog = [];
      for (var i = 0; i < features.length; i++) {
        var g = features[i].geometry;
        var lines = [];
        linesLog.push(g.components.length);
        for (var j = 0; j < g.components.length; j++) {
          var c = g.components[j];
          lines.push({
            x: c.x,
            y: c.y
          });
        }
        fc.lines.push(lines);
      }
      Racing.log('Straat: ' + features.length + ' Lines (' + linesLog.join(', ') + ' Points)');
      Racing.straat = fc;
      showCapabilitiesGrid();
    }
  },
  addLayers: function() {
    Racing.log('Adding Layer: ' + Racing.layerToActivate);
    Racing.timer();
    Racing.addLayersByName([Racing.layerToActivate]);
    wmsWin.close();
    Racing.layerNames = map.layers.map(function(index, item) {
      return index.name
    }).reverse();
    Racing.log('Added Layer: ' + Racing.layerToActivate);
    Racing.log('Zooming To Scale: ' + Racing.zoomToScale);
    Racing.timer();
    map.zoomToScale(Racing.zoomToScale);
    Racing.log('Zoomed To Scale: ' + Racing.zoomToScale);
    var straatLinePoint = Racing.straat.lines[Racing.straatLine][Racing.straatLinePoint];
    map.setCenter([straatLinePoint.x, straatLinePoint.y]);
    Racing.activeLayer = Racing.layerByName(Racing.layerToActivate);
    Racing.log('Start Copy Layer ' + Racing.layerToActivateName);
    Racing.timer();
    setTimeout(Racing.copyLayer, 0);
  },
  copyLayer: function(callback) {
    if (Racing.canvas == null) {
      Racing.canvas = document.createElement('canvas');
      document.body.appendChild(Racing.canvas);
    }
    var layer = Racing.layerByName(Racing.layerToActivateName);
    if (layer.loading) {
      setTimeout(Racing.copyLayer);
    } else {
      Racing.log('Start Copy Layer ' + Racing.layerToActivateName + ' Loaded');
      var canvas = Racing.canvas;
      var context = canvas.getContext('2d');
      canvas.width = layer.div.scrollWidth;
      canvas.height = layer.div.scrollHeight;
      canvas.style.position = 'absolute';
      canvas.style.left = 0;
      canvas.style.top = 0;
      canvas.style.zIndex = 6000;
      canvas.style.backgroundColor = 'white';
      var position = layer.div.getBoundingClientRect();
      var grid = layer.grid;
      Racing.log('Loading ' + grid.length * grid[0].length + ' Tiles');
      Racing.timer();
      for (var x = 0; x < grid.length; x++) {
        for (var y = 0; y < grid[x].length; y++) {
          var tile = grid[x][y];
          context.drawImage(tile.imgDiv, tile.position.x + position.left, tile.position.y + position.top, tile.size.w, tile.size.h);
        }
      }
      Racing.log('Loaded ' + grid.length * grid[0].length + ' Tiles');
      var imageWidth = canvas.width;
      var imageHeight = canvas.height;
      var imageData = context.getImageData(0, 0, imageWidth, imageHeight);
      var data = imageData.data;
      Racing.log('Searching Known Colors');
      Racing.timer();
      var colors = {};
      for (var i = 0, n = data.length; i < n; i += 4) {
        var red = data[i];
        var green = data[i + 1];
        var blue = data[i + 2];
        var alpha = data[i + 3];
        var color = 'rgba(' + red + ',' + green + ',' + blue + ',' + 255 / alpha + ')';
        if (colors[color] == null) {
          colors[color] = 1;
        } else {
          colors[color]++;
        }
        if (red == 0 && green == 0 && blue == 0 && alpha == 0) {
          red = green = blue = 255;
          data[i] = data[i + 1] = data[i + 2] = 255;
          alpha = 255;
          data[i + 3] = 255;
        }
        if (red == 204 && green == 204 && blue == 204 && alpha == 255) {
          red = green = blue = 255;
          data[i] = data[i + 1] = data[i + 2] = 255;
          alpha = 255;
          data[i + 3] = 255;
        }
        if (red == 183 && green == 183 && blue == 183 && alpha == 255) {
          red = green = blue = 255;
          data[i] = data[i + 1] = data[i + 2] = 255;
          alpha = 255;
          data[i + 3] = 255;
        }
        if (red == 250 && green == 155 && blue == 135 && alpha == 255) {
          red = green = blue = 255;
          data[i] = data[i + 1] = data[i + 2] = 255;
          alpha = 255;
          data[i + 3] = 255;
        }
        if (red == 250 && green == 125 && blue == 105 && alpha == 255) {
          red = green = blue = 255;
          data[i] = data[i + 1] = data[i + 2] = 255;
          alpha = 255;
          data[i + 3] = 255;
        }
        if (red != 255 || green != 255 || blue != 255 || alpha != 255) {
          red = green = blue = 0;
          data[i] = data[i + 1] = data[i + 2] = 0;
          alpha =  255;
          data[i + 3] = 255;
        }
      }
      Racing.log('Found Known Colors');
      Racing.timer();
      context.putImageData(imageData, 0, 0);
      Racing.log('Removed Known Colors');
      Racing.log('Searching Remaining Colors');
      Racing.timer();
      var colors = {};
      for (var i = 0, n = data.length; i < n; i += 4) {
        var red = data[i];
        var green = data[i + 1];
        var blue = data[i + 2];
        var alpha = data[i + 3];
        var color = red + ' ' + green + ' ' + blue + ' ' + alpha;
        if (colors[color] == null) {
          colors[color] = 1;
        } else {
          colors[color]++;
        }
      }
      Racing.log('Found Remaining Colors');
      for (var color in colors) {
        Racing.log('Found color ' + color + ' : ' + colors[color] + ' pixels');
      }
      var x = 20;
      var y = 20;
      var red = data[((imageWidth * y) + x) * 4];
      var green = data[((imageWidth * y) + x) * 4 + 1];
      var blue = data[((imageWidth * y) + x) * 4 + 2];
      var alpha = data[((imageWidth * y) + x) * 4 + 3];
      context.fillStyle = '#000000';
      var twopi = 2 * Math.PI;
      for (var y = 0; y < imageHeight; y++) {
        for (var x = 0; x < imageWidth; x++) {
          var red = data[((imageWidth * y) + x) * 4];
          var green = data[((imageWidth * y) + x) * 4 + 1];
          var blue = data[((imageWidth * y) + x) * 4 + 2];
          var alpha = data[((imageWidth * y) + x) * 4 + 3];
          if (red == 0 && green == 0 && blue == 0 && alpha == 255) {
            context.beginPath();
            context.arc(x, y, 3, twopi, false);
            context.closePath();
            context.fill();
          }
        }
      }
      Racing.log('Searching Corners');
      Racing.timer();
      var params = {
        qualityLevel: 0.01,
        blockSize: 5,
        k: parseFloat(Racing.k)
      };
      var corners = CornerDetector.detect(imageData, 'harris', params);
      var p = Racing.plotCorners(corners, context);
      Racing.log('Found ' + p.length + ' Corners');
      //Racing.log(JSON.stringify(p).split('},').join('},\n  '));
      var l = [];
      var lineColors = ['#FF0000'];
      var lineColorIndex = 0;
      var lines = [];
      var linesFound = [];
      var xi, yi, xj, yj;
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', canvas.getAttribute('width'));
      svg.setAttribute('height', canvas.getAttribute('height'));
      svg.style.position = 'absolute';
      svg.style.zIndex = canvas.style.zIndex + 1;
      document.body.appendChild(svg);
      var start = null;
      var end = null;
      var polygons = [];
      var polygon = [];
      for (var i = 0; i < p.length; i++) {
        xi = p[i].x;
        yi = p[i].y;
        var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', xi);
        circle.setAttribute('cy', yi);
        circle.setAttribute('stroke', 'yellow');
        circle.setAttribute('stroke-width', 5);
        circle.setAttribute('fill', 'yellow');
        circle.setAttribute('r', 5);
        circle.setAttribute('class', 'circle');
        circle.addEventListener('mouseover', function(evt) {
          this.setAttribute('stroke-width', 10);
        });
        circle.addEventListener('mouseout', function(evt) {
          this.setAttribute('stroke-width', 5);
        });
        circle.addEventListener('mouseup', function(evt) {
          if (start == null) {
            start = {
              x: this.getAttribute('cx'),
              y: this.getAttribute('cy')
            }
            var lonlat = map.getLonLatFromPixel({
              x: parseInt(start.x),
              y: parseInt(start.y)
            })
            polygon.push([lonlat.lon, lonlat.lat]);
          } else {
            end = {
              x: this.getAttribute('cx'),
              y: this.getAttribute('cy')
            }
            var lonlat = map.getLonLatFromPixel({
              x: parseInt(end.x),
              y: parseInt(end.y)
            })
            polygon.push([lonlat.lon, lonlat.lat]);
            var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', start.x);
            line.setAttribute('y1', start.y);
            line.setAttribute('x2', end.x);
            line.setAttribute('y2', end.y);
            line.setAttribute('stroke', 'yellow');
            line.setAttribute('stroke-width', 5);
            svg.appendChild(line);
            start = end;
            if (polygon[0][0] == polygon[polygon.length - 1][0] && polygon[0][1] == polygon[polygon.length - 1][1]) {
              console.log(JSON.stringify(polygon));
            }
          }
        });
        svg.appendChild(circle);
      }
      Racing.log('Searching Lines');
      Racing.timer();
      for (var i = 0; i < p.length; i++) {
        for (var j = 0; j < p.length; j++) {
          if (i != j) {
            xj = p[j].x;
            yj = p[j].y;
            var x = Math.round((xi + xj) / 2);
            var y = Math.round((yi + yj) / 2);
            var lineStart = Racing.pixel(data, imageWidth, xi, yi);
            var lineMiddle = Racing.pixel(data, imageWidth, x, y);
            var lineEnd = Racing.pixel(data, imageWidth, xj, yj);
            if (lineMiddle === '0 0 0 255') {
              var line = xj + ',' + yj + ' ' + xi + ', ' + yi;
              if (linesFound.indexOf(line) == -1) {
                line = xi + ',' + yi + ' ' + xj + ', ' + yj;
                linesFound.push(line);
                l.push({
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
      Racing.log('Found ' + linesFound.length + ' Lines');
      /*var myCanvas = document.createElement('canvas');
      myCanvas.setAttribute('id', 'my_canvas');
      myCanvas.width = Racing.canvas.width;
      myCanvas.height = Racing.canvas.height;
      myCanvas.style.cssText = Racing.canvas.style.cssText;
      myCanvas.style.zIndex = Racing.canvas.style.zIndex + 1;
      myCanvas.style.backgroundColor = '#555';
      document.body.appendChild(myCanvas);
      lines = [];*/
      /*for (var i = 0; i < l.length; i++) {
        var line = l[i];
        var from = line.from;
        var to = line.to;
        var line = new Line([{
          x: from.x,
          y: from.y
        }, {
          x: to.x,
          y: to.y
        }]);
        lines.push(line);
        Racing.log('Line from ' + from.x + ',' + from.y + ' to ' + to.x + ',' + to.y);
      }
      document.getElementById('my_canvas').onmouseup = function(e) {
        var canvas = document.getElementById('my_canvas');
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          line.select(false);
          if (line.hitTestPoint(e, 5)) {
            line.select(true);
          }
        }
      };*/
      /*var colors = {};
      for (var y = 0; y < imageHeight; y++) {
        for (var x = 0; x < imageWidth; x++) {
          var red = data[((imageWidth * y) + x) * 4];
          var green = data[((imageWidth * y) + x) * 4 + 1];
          var blue = data[((imageWidth * y) + x) * 4 + 2];
          var alpha = data[((imageWidth * y) + x) * 4 + 3];
          var color = red + ' ' + green + ' ' + blue + ' ' + alpha;
          if (color == '255 255 255 255') {
            data[((imageWidth * y) + x) * 4 + 3] = 0;
          }
          if (colors[color] == null) {
            colors[color] = 1;
          } else {
            colors[color]++;
          }
        }
      }
      Racing.canvas.style.backgroundColor = 'none';*/
      Racing.log('Done');
    }
  },
  closeMenu: function() {
    Racing.port.postMessage({
      action: 'closeMenu'
    });
  },
  log: function(message) {
    Racing.port.postMessage({
      action: 'log',
      message: message + (Racing.timestamp != null ? ' <b>[' + (new Date().getTime() - Racing.timestamp) + ' ms]</b>' : '')
    });
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