var baseURL = 'http://geo-vlaanderen.agiv.be/gdiviewer/';
var proxyURL = 'http://geo-vlaanderen.agiv.be/proxy88/Proxy/RegularProxy.ashx?url=http://geo.api.agiv.be/geodiensten/raadpleegdiensten/GRB/wms??LAYERS=GRB_WBN&EXCEPTIONS=XML&FORMAT=image%2Fpng&TRANSPARENT=TRUE&VERSION=1.3.0&SERVICE=WMS&REQUEST=GetMap&STYLES=&ISBASELAYER=false&REALMINSCALE=75000&REALMAXSCALE=250&CRS=EPSG%3A31370&BBOX=';
var proxyURL2 = 'http://geo-vlaanderen.agiv.be/proxy88/Proxy/RegularProxy.ashx?url=http://geo.api.agiv.be/geodiensten/raadpleegdiensten/GRB/wms??LAYERS=GRB_WGO&EXCEPTIONS=XML&FORMAT=image%2Fpng&TRANSPARENT=TRUE&VERSION=1.3.0&SERVICE=WMS&REQUEST=GetMap&STYLES=&ISBASELAYER=false&REALMINSCALE=1500&REALMAXSCALE=250&CRS=EPSG%3A31370&BBOX=';
var proxyURL3 = 'http://geo-vlaanderen.agiv.be/proxy88/Proxy/RegularProxy.ashx?url=http://geo.api.agiv.be/geodiensten/raadpleegdiensten/GRB/wms??LAYERS=GRB_GBG&EXCEPTIONS=XML&FORMAT=image%2Fpng&TRANSPARENT=TRUE&VERSION=1.3.0&SERVICE=WMS&REQUEST=GetMap&STYLES=&ISBASELAYER=false&REALMINSCALE=75000&REALMAXSCALE=250&CRS=EPSG%3A31370&BBOX=';
function checkForValidUrl(tabId, changeInfo, tab) {
  if (tab.url.indexOf(baseURL) == 0) {
    chrome.pageAction.show(tabId);
  }
};
chrome.tabs.onUpdated.addListener(checkForValidUrl);
chrome.webRequest.onBeforeRequest.addListener(function(details) {
  var url = details.url.replace(baseURL, '');
  switch (details.type) {
    case 'stylesheet':
      switch (url) {
        case 'css/ext-carto_css.css':
        case 'css/mapToolbar.css':
        case 'js/ExtJs-3.2.1/examples.css':
        case 'js/ExtJs-3.2.1/FileUploadField.css':
        case 'js/ExtJs-3.2.1/statusbar/css/statusbar.css':
        case 'js/ExtJs-3.2.1/resources/css/ext-all.css':
        case 'js/ExtJs-3.2.1/rowactions/Ext.ux.grid.RowActions.css':
          return {
            redirectUrl: chrome.extension.getURL(url)
          };
        case 'theme/default/style.css':
          return {
            redirectUrl: chrome.extension.getURL('js/OpenLayers-2.13.1/' + url)
          };
        default:
          console.log('TYPE ' + details.type + '\n' + url);
      }
      break;
    case 'script':
      switch (url) {
        case 'js/ExtJs-3.2.1/adapter/ext/ext-base.js':
        case 'js/Config/Config_Configureer.js':
        case 'js/Config/Config_constants.js':
        case 'js/Config/Config_viewport.js':
        case 'js/Config/Map_events.js':
        case 'js/Config/Map_functions.js':
        case 'js/Config/Map_toolbars.js':
        case 'js/Config/mobilemapping.js?':
        case 'js/Config/Panels_layers.js':
        case 'js/Config/Panels_map.js':
        case 'js/Config/Panels_search_Capakey.js':
        case 'js/Config/Panels_search_Coordinaten.js':
        case 'js/Config/Panels_search_Crab.js':
        case 'js/Config/Publieksviewer.js':
        case 'js/Config/projecties.js':
        case 'js/Config/Util.js':
        case 'js/ExtJs-3.2.1/ExtJs_Image.js':
        case 'js/ExtJs-3.2.1/ext-all.js':
        case 'js/ExtJs-3.2.1/FileUploadField.js':
        case 'js/ExtJs-3.2.1/RowExpander.js':
        case 'js/ExtJs-3.2.1/rowactions/Ext.ux.grid.RowActions.js':
        case 'js/ExtJs-3.2.1/statusbar/StatusBar.js':
        case 'js/GeneralFunctions.js':
        case 'js/GeoExt/script/GeoExt.js':
        case 'js/OpenLayers-2.13.1/OpenLayers.js':
          return {
            redirectUrl: chrome.extension.getURL('empty.js')
          };
        default:
          console.log('TYPE ' + details.type + '\n' + url);
          if (details.url == 'http://www.google-analytics.com/ga.js') {
            return {
              redirectUrl: chrome.extension.getURL('js/ga.js')
            }
          }
          return {
            redirectUrl: 'javascript:'
          };
      }
    case 'image':
      switch (url) {
        case 'img/AgivLogo.jpg':
          return {
            redirectUrl: chrome.extension.getURL(url)
          };
        case 'img/help.png':
        case 'img/layer-switcher-maximize.png':
        case 'img/layer-switcher-minimize.png':
        case 'img/pan.png':
        case 'img/ruler.png':
        case 'img/ruler_square.png':
        case 'img/ZoomToBox.png':
          return {
            redirectUrl: chrome.extension.getURL('js/OpenLayers-2.13.1/' + url)
          }
        case 'http://geo-vlaanderen.agiv.be/proxy88/Proxy/RegularProxy.ashx?url=http://geo.agiv.be/ogc/wms/navstreets?LAYERS=6&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&FORMAT=image%2Fjpeg&SRS=EPSG%3A31370&BBOX=22000,150000,359066.66666667,487066.66666667&WIDTH=256&HEIGHT=256':
          return {
            redirectUrl: chrome.extension.getURL('tiles/' + url.replace('http://geo-vlaanderen.agiv.be/proxy88/Proxy/RegularProxy.ashx?url=http://geo.agiv.be/ogc/wms/navstreets?LAYERS=6&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&FORMAT=image%2Fjpeg&SRS=EPSG%3A31370&', '').replace('&WIDTH=256&HEIGHT=256', '') + '.jpg')
          }
        case 'http://grb.agiv.be/geodiensten/raadpleegdiensten/GRB-basiskaart/wms?LAYERS=GRB_BASISKAART&TRANSPARENT=FALSE&FORMAT=image%2Fpng&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG%3A31370&BBOX=238747.10016087,150000,347120.6502413,258373.55008043&WIDTH=512&HEIGHT=512':
        case 'http://grb.agiv.be/geodiensten/raadpleegdiensten/GRB-basiskaart/wms?LAYERS=GRB_BASISKAART&TRANSPARENT=FALSE&FORMAT=image%2Fpng&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG%3A31370&BBOX=22000,150000,130373.55008043,258373.55008043&WIDTH=512&HEIGHT=512':
        case 'http://grb.agiv.be/geodiensten/raadpleegdiensten/GRB-basiskaart/wms?LAYERS=GRB_BASISKAART&TRANSPARENT=FALSE&FORMAT=image%2Fpng&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG%3A31370&BBOX=130373.55008043,150000,238747.10016087,258373.55008043&WIDTH=512&HEIGHT=512':
          return {
            redirectUrl: chrome.extension.getURL('tiles/' + url.replace('http://grb.agiv.be/geodiensten/raadpleegdiensten/GRB-basiskaart/wms?LAYERS=GRB_BASISKAART&TRANSPARENT=FALSE&FORMAT=image%2Fpng&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG%3A31370&', '').replace('&WIDTH=512&HEIGHT=512', '') + '.png')
          };
        default:
          if (url.indexOf(proxyURL) == 0) {
            var key = url.replace(proxyURL, 'GRB_WBN');
            var cachedImage = window.localStorage.getItem(key);
            if (cachedImage == null) {
              var img = new Image();
              img.onload = function() {
                var canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 512;
                var context = canvas.getContext('2d');
                context.drawImage(this, 0, 0, canvas.width, canvas.height);
                var key = this.src.replace(proxyURL, 'GRB_WBN');
                window.localStorage.setItem(key, canvas.toDataURL());
              }
              img.src = url;
            } else {
              return {
                redirectUrl: cachedImage
              };
            }
          } else {
            if (url.indexOf(proxyURL2) == 0) {
              var key = url.replace(proxyURL2, 'GRB_WGO');
              var cachedImage = window.localStorage.getItem(key);
              if (cachedImage == null) {
                var img = new Image();
                img.onload = function() {
                  var canvas = document.createElement('canvas');
                  canvas.width = 512;
                  canvas.height = 512;
                  var context = canvas.getContext('2d');
                  context.drawImage(this, 0, 0, canvas.width, canvas.height);
                  var key = this.src.replace(proxyURL2, 'GRB_WGO');
                  window.localStorage.setItem(key, canvas.toDataURL());
                }
                img.src = url;
              } else {
                return {
                  redirectUrl: cachedImage
                };
              }
            } else {
              if (url.indexOf(proxyURL3) == 0) {
                var key = url.replace(proxyURL3, 'GRB_GBG');
                var cachedImage = window.localStorage.getItem(key);
                if (cachedImage == null) {
                  var img = new Image();
                  img.onload = function() {
                    var canvas = document.createElement('canvas');
                    canvas.width = 512;
                    canvas.height = 512;
                    var context = canvas.getContext('2d');
                    context.drawImage(this, 0, 0, canvas.width, canvas.height);
                    var key = this.src.replace(proxyURL3, 'GRB_GBG');
                    window.localStorage.setItem(key, canvas.toDataURL());
                  }
                  img.src = url;
                } else {
                  return {
                    redirectUrl: cachedImage
                  };
                }
              } else {
                console.log('TYPE ' + details.type + '\n' + url);
              }
            }
          }
      }
      if (details.url == 'http://geo.api.agiv.be/geodiensten/raadpleegdiensten/GRB/wms?version=1.3.0&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=GRB_BASISKAART&format=image/png&STYLE=default&SCALE=250.00000000000003') {
        return {
          redirectUrl: chrome.extension.getURL('GetLegendGraphic&sld_version=1.1.0&layer=GRB_BASISKAART&STYLE=default&SCALE=250.00000000000003.png')
        }
      }
      switch (url) {
        case 'img/world.png':
        case 'img/drop-add.gif':
        case 'img/tool-sprites.gif':
        case 'js/ExtJs-3.2.1/rowactions/database_go.png':
        case 'js/ExtJs-3.2.1/resources/images/default/window/icon-info.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/qtip/tip-sprite.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/qtip/tip-anchor-sprite.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/form/text-bg.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/grid/grid-blue-split.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/button/arrow.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/form/trigger.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/tree/leaf.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/tree/elbow.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/tree/elbow-minus.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/slider/slider-v-thumb.png':
        case 'js/ExtJs-3.2.1/resources/images/default/toolbar/bg.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/panel/white-top-bottom.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/button/btn.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/tree/elbow-minus.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/slider/slider-v-bg.png':
        case 'js/ExtJs-3.2.1/resources/images/default/tree/elbow-end-minus.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/tree/elbow-end.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/tree/elbow-line.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/grid/grid3-hrow.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/grid/row-expand-sprite.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/shadow-c.png':
        case 'js/ExtJs-3.2.1/resources/images/default/shadow-lr.png':
        case 'js/ExtJs-3.2.1/resources/images/default/sizer/se-handle.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/sizer/s-handle.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/window/right-corners.png':
        case 'js/ExtJs-3.2.1/resources/images/default/sizer/nw-handle.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/sizer/ne-handle.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/window/left-right.png':
        case 'js/ExtJs-3.2.1/resources/images/default/window/left-corners.png':
        case 'js/ExtJs-3.2.1/resources/images/default/grid/grid3-special-col-sel-bg.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/grid/grid3-special-col-bg.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/grid/grid3-hd-btn.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/sizer/e-handle.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/grid/col-move-top.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/grid/col-move-bottom.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/qtip/bg.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/window/top-bottom.png':
        case 'js/ExtJs-3.2.1/resources/images/default/progress/progress-bg.gif':
        case 'js/ExtJs-3.2.1/resources/images/default/shadow.png':
        case 'js/ExtJs-3.2.1/resources/images/default/sizer/sw-handle.gif':
          return {
            redirectUrl: chrome.extension.getURL(url)
          }
          break;
        default:
          console.log(url);
      }  
      break;
    case 'main_frame':
      //console.log('TYPE ' + details.type + '\n' + url);
      break;
    case 'other':
      if (details.url == 'http://geo-vlaanderen.agiv.be/favicon.ico') {
        return {
          redirectUrl: chrome.extension.getURL('favicon.ico')
        };
      } else {
        console.log('TYPE ' + details.type + '\n' + url);
      }
      break;
    default:
      console.log('TYPE ' + details.type + '\n' + url);
      if (details.url == 'www.google-analytics.com/ga.js') {
        return {
          redirectUrl: chrome.extension.getURL('js/ga.js')
        }
      }
      console.log(details.type + ' ' + details.url);
  }
}, {
  urls: [
    'http://geo-vlaanderen.agiv.be/*',
    'http://grb.agiv.be/*',
    'http://geo.api.agiv.be/*',
    'http://www.google-analytics.com/*'
  ],
  types: [
    'script',
    'stylesheet',
    'image',
    'object',
    'other',
    'main_frame'
  ]
}, ['blocking']);
