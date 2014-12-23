window.Racing = {
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
      //console.log(fc);
      Racing.log('Straat: ' + features.length + ' Lines (' + linesLog.join(', ') + ' Points)');
      Racing.straat = fc;
      showCapabilitiesGrid();
    }
  },
  addLayers: function() {
    Racing.log('Adding Layer: ' + Racing.layerToActivate);
    Racing.timer();
    //Racing.addLayersByName([Racing.layerToActivate, 'GRB_WGO']);
    Racing.addLayersByName(Racing.layersToActivate);
    wmsWin.close();
    Racing.layerNames = map.layers.map(function(index, item) {
      return index.name
    }).reverse();
    Racing.log('Added Layer: ' + Racing.layerToActivate);
    Racing.log('Zooming To Scale: ' + Racing.zoomToScale);
    Racing.timer();
    //map.zoomToScale(Racing.zoomToScale);
    Racing.log('Zoomed To Scale: ' + Racing.zoomToScale);
    if (typeof Racing.straatLinePoint == 'string') {
      var straatLinePoint1 = Racing.straat.lines[Racing.straatLine][parseInt(Racing.straatLinePoint.split('-')[0])];
      var straatLinePoint2 = Racing.straat.lines[Racing.straatLine][parseInt(Racing.straatLinePoint.split('-')[1])];
      /*var straatLinePoint = {
        x: (straatLinePoint1.x + straatLinePoint2.x) / 2,
        y: (straatLinePoint1.y + straatLinePoint2.y) / 2
      };*/
      var bounds = new OpenLayers.Bounds();
      bounds.extend(new OpenLayers.LonLat(straatLinePoint1.x, straatLinePoint1.y));
      bounds.extend(new OpenLayers.LonLat(straatLinePoint2.x, straatLinePoint2.y));
      map.zoomToExtent(bounds, true);
    } else {
      var straatLinePoint = Racing.straat.lines[Racing.straatLine][Racing.straatLinePoint];
      //map.setCenter([straatLinePoint.x, straatLinePoint.y]);
      //map.zoomToScale(Racing.zoomToScale);
      var bounds = new OpenLayers.Bounds();
      bounds.extend(new OpenLayers.LonLat(straatLinePoint.x, straatLinePoint.y));
      bounds.extend(new OpenLayers.LonLat(straatLinePoint.x, straatLinePoint.y));
      map.zoomToExtent(bounds, true);
    }
    Racing.activeLayer = Racing.layerByName(Racing.layerToActivate);
    Racing.log('Start Copy Layer ' + Racing.layerToActivateName);
    Racing.timer();
    setTimeout(Racing.copyLayer, 0);
  },
  findKnownColorsORIGINAL: function(canvas) {
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
        case '0xCCCCCCFF':
        case '0xB7B7B7FF':
        case '0xFA9B87FF':
        case '0xFA7D69FF':
          color = '0xFFFFFFFF';
          red = green = blue = 255;
          data[i] = data[i + 1] = data[i + 2] = 255;
          alpha = 255;
          data[i + 3] = 255;
          break;
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
    return {
      colors: colors,
      imageData: imageData
    };
  },
  findKnownColors: function(canvas) {
    var context = canvas.getContext('2d');
    var imageWidth = canvas.width;
    var imageHeight = canvas.height;
    var imageData = context.getImageData(0, 0, imageWidth, imageHeight);
    var data = imageData.data;
    var b = new ArrayBuffer(data.length);
    var u32 = new Uint32Array(data.buffer);
    var dv = new DataView(data.buffer);
    var colors = {};
    for (var i = 0, n = data.length / 4; i < n; i++) {
      var color = u32[i];
      if (colors[color] == null) {
        colors[color] = 1;
      } else {
        colors[color]++;
      }
      switch (color) {
        /*case '0x0':
        case '0xF':
        case '0xF00':
        case '0xF0000':
        case '0xF000000':*/
        case 0xff697dfa:
        case 0xff879bfa:
          color = 0xffff;
          u32[i] = 0xffff;
          break;
        default:
          if (color != 0xffff) {
            color = 0x000f;
            u32[i] = 0x000f;
          }
      }
    }
    console.log(colors);
    return {
      colors: colors,
      imageData: imageData
    };
  },
  findRemainingColors: function(canvas) {
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
      //var color = red + ' ' + green + ' ' + blue + ' ' + alpha;
      var color = '0x' + ((red * 256 * 256 * 256) + (green * 256 * 256) + (blue * 256) + alpha).toString(16).toUpperCase();
      if (colors[color] == null) {
        colors[color] = 1;
      } else {
        colors[color]++;
      }
    }
    return {
      imageData: imageData,
      colors: colors
    };
  },
  drawRemainingBlackLines: function(canvas) {
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
  },
  findLines: function(canvas, points) {
    var l = [];
    var linesFound = [];
    var xi, yi, xj, yj;
    var context = canvas.getContext('2d');
    var imageWidth = canvas.width;
    var imageHeight = canvas.height;
    var imageData = context.getImageData(0, 0, imageWidth, imageHeight);
    var data = imageData.data;
    for (var i = 0; i < points.length; i++) {
      for (var j = 0; j < points.length; j++) {
        if (i != j) {
          xj = points[j].x;
          yj = points[j].y;
          var x = Math.round((xi + xj) / 2);
          var y = Math.round((yi + yj) / 2);
          var lineMiddle = Racing.pixel(data, imageWidth, x, y);
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
    return {
      linesFound: linesFound,
      l: l
    };
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
      /*Racing.canvas = document.createElement('canvas');
      document.body.appendChild(Racing.canvas);
      Racing.context = Racing.canvas.getContext('2d');
      Racing.canvas.style.position = 'absolute';
      Racing.canvas.style.left = 0;
      Racing.canvas.style.top = 0;
      Racing.canvas.style.zIndex = 6000;
      Racing.canvas.style.backgroundColor = 'transparent';*/
    }
    Racing.currentLayer = Racing.layerByName(Racing.layerToActivateName);
    if (Racing.currentLayer.loading) {
      setTimeout(Racing.copyLayer);
    } else {
      Racing.log('Start Copy Layer ' + Racing.layerToActivateName + ' Loaded');
      //var canvas = Racing.canvas;
      //var context = Racing.context;
      var position = Racing.currentLayer.div.getBoundingClientRect();
      var grid = Racing.currentLayer.grid;
      Racing.log('Loading ' + grid.length * grid[0].length + ' Tiles');
      if (Racing.layerToActivate == Racing.layersToActivate[1]) {
        Racing.context.globalCompositeOperation = 'overlay';
      } else {
        Racing.canvas.width = Racing.currentLayer.div.scrollWidth;
        Racing.canvas.height = Racing.currentLayer.div.scrollHeight;
      }
      Racing.timer();
      var gridColumns = grid.length;
      for (var x = 0; x < gridColumns; x++) {
        var gridColumn = grid[x];
        var gridRows = gridColumn.length;
        for (var y = 0; y < gridRows; y++) {
          var tile = gridColumn[y];
          Racing.context.drawImage(tile.imgDiv, tile.position.x + position.left, tile.position.y + position.top, tile.size.w, tile.size.h);
        }
      }
      Racing.log('Loaded ' + grid.length * grid[0].length + ' Tiles');
      if (Racing.layersToActivate.length > 1 && Racing.layerToActivate != Racing.layersToActivate[1]) {
        Racing.layerToActivate = Racing.layersToActivate[1];
        Racing.layerToActivateName = Racing.layersToActivateName[1];
        setTimeout(Racing.copyLayer, 0);
        return;
      }
      Racing.log('Searching Known Colors');
      Racing.timer();
      Racing.imageData = Racing.findKnownColorsORIGINAL(Racing.canvas).imageData;
      //Racing.data = Racing.imageData.data;
      //var imageWidth = canvas.width;
      //var imageHeight = canvas.height;
      Racing.log('Found Known Colors');
      Racing.timer();
      Racing.context.putImageData(Racing.imageData, 0, 0);
      Racing.log('Removed Known Colors');
      /*Racing.log('Searching Remaining Colors');
      Racing.timer();
      var colors = Racing.findRemainingColors(Racing.canvas).colors;
      Racing.log('Found Remaining Colors');
      for (var color in colors) {
        Racing.log('Found color ' + color + ' : ' + colors[color] + ' pixels');
      }*/
      Racing.drawRemainingBlackLines(Racing.canvas);
      Racing.log('Searching Corners');
      Racing.timer();
      /*var params = {
        qualityLevel: 0.01,
        blockSize: 5,
        k: parseFloat(Racing.k)
      };*/
      Racing.corners = CornerDetector.detect(Racing.imageData, 'harris', {
        qualityLevel: 0.01,
        blockSize: 5,
        k: parseFloat(Racing.k)
      });
      Racing.points = Racing.plotCorners(Racing.corners, Racing.context);
      Racing.log('Found ' + Racing.points.length + ' Corners');
      //var lineColors = ['#FF0000'];
      //var lineColorIndex = 0;
      //var lines = [];
      //var xi, yi, xj, yj;
      Racing.createSVG();
      /*Racing.svg = document.createElementNS(Racing.SVG, 'svg');
      Racing.svg.setAttribute('width', canvas.getAttribute('width'));
      Racing.svg.setAttribute('height', canvas.getAttribute('height'));
      Racing.svg.style.position = 'absolute';
      Racing.svg.style.zIndex = canvas.style.zIndex + 1;
      document.body.appendChild(Racing.svg);*/
      Racing.resetPolygon();
      /*Racing.start = null;
      Racing.end = null;
      Racing.polygons = [];
      Racing.polygon = [];*/
      for (var i = 0; i < Racing.points.length; i++) {
        var x = Racing.points[i].x;
        var y = Racing.points[i].y;
        var circle = document.createElementNS(Racing.SVG, 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('stroke', 'blue');
        circle.setAttribute('stroke-width', 2);
        circle.setAttribute('fill', 'blue');
        circle.setAttribute('r', 2);
        circle.setAttribute('class', 'circle');
        circle.addEventListener('mouseover', Racing.circleOver/*function(evt) {
          this.setAttribute('stroke-width', 10);
          this.setAttribute('stroke', 'red');
        }*/);
        circle.addEventListener('mouseout', Racing.circleOut/*function(evt) {
          this.setAttribute('stroke-width', 2);
          this.setAttribute('stroke', 'blue');
        }*/);
        circle.addEventListener('mouseup', function(evt) {
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
            Racing.start = pixels;/*{
              x: this.getAttribute('cx'),
              y: this.getAttribute('cy')
            }*/
            /*var lonlat = map.getLonLatFromPixel({
              x: parseInt(Racing.start.x),
              y: parseInt(Racing.start.y)
            });*/
            //Racing.polygon.push([lonlat.lon.toFixed(2), lonlat.lat.toFixed(2)]);
          } else {
            Racing.end = pixels;/*{
              x: this.getAttribute('cx'),
              y: this.getAttribute('cy')
            }*/
            /*var lonlat = map.getLonLatFromPixel({
              x: parseInt(Racing.end.x),
              y: parseInt(Racing.end.y)
            });*/
            //Racing.polygon.push([lonlat.lon.toFixed(2), lonlat.lat.toFixed(2)]);
            Racing.createLine();
            /*var line = document.createElementNS(Racing.SVG, 'line');
            line.setAttribute('x1', Racing.start.x);
            line.setAttribute('y1', Racing.start.y);
            line.setAttribute('x2', Racing.end.x);
            line.setAttribute('y2', Racing.end.y);
            line.setAttribute('stroke', 'red');
            line.setAttribute('stroke-width', 2);
            Racing.svg.appendChild(line);*/
            Racing.start = Racing.end;
            Racing.checkPolygonClosed();
            //if (Racing.polygon[0][0] == Racing.polygon[Racing.polygon.length - 1][0] && Racing.polygon[0][1] == Racing.polygon[Racing.polygon.length - 1][1]) {
            //  Racing.polygon.pop();
            //  console.log(JSON.stringify(Racing.polygon).replace(/"/g, ''));
            //  Racing.resetPolygon();
              /*Racing.start = null;
              Racing.end = null;
              Racing.polygons = [];
              Racing.polygon = [];*/
            //}
          }
        });
        Racing.svg.appendChild(circle);
      }
      Racing.log('Searching Lines');
      Racing.timer();
      //var linesFound = Racing.findLines(Racing.canvas, Racing.p).linesFound;
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