var baseURL = 'http://geo-vlaanderen.agiv.be/gdiviewer/';
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
        /*case 'theme/default/style.css':
          return {
            redirectUrl: baseURL + 'js/OpenLayers-2.13.1/theme/default/style.css'
          };
        case 'js/OpenLayers-2.13.1/theme/default/style.css':
          return {
            redirectUrl: chrome.extension.getURL(url)
          };*/
        default:
          console.log('TYPE ' + details.type + '\n' + url);
      }
      if (url == 'theme/default/style.css') {
        return {
          redirectUrl: baseURL + 'js/OpenLayers-2.13.1/theme/default/style.css'
        };
      }
      /*if (url == 'js/ExtJs-3.2.1/rowactions/Ext.ux.grid.RowActions.css') {
        return {
          redirectUrl: chrome.extension.getURL(url)
        };
      }*/
      /*if (url == 'js/ExtJs-3.2.1/resources/css/ext-all.css') {
        return {
          redirectUrl: chrome.extension.getURL(url)
        };
      }*/
      /*if (url == 'css/ext-carto_css.css') {
        return {
          redirectUrl: chrome.extension.getURL(url)
        };
      }*/
      if (url == 'js/OpenLayers-2.13.1/theme/default/style.css') {
        return {
          redirectUrl: chrome.extension.getURL(url)
        };
      }
      /*if (url == 'js/ExtJs-3.2.1/examples.css') {
        return {
          redirectUrl: chrome.extension.getURL(url)
        };
      }*/
      /*if (url == 'css/mapToolbar.css') {
        return {
          redirectUrl: chrome.extension.getURL(url)
        };
      }*/
      /*if (url == 'js/ExtJs-3.2.1/statusbar/css/statusbar.css') {
        return {
          redirectUrl: chrome.extension.getURL(url)
        };
      }*/
      /*if (url == 'js/ExtJs-3.2.1/FileUploadField.css') {
        return {
          redirectUrl: chrome.extension.getURL(url)
        };
      }*/
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
            //redirectUrl: 'javascript:'
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
      console.log('TYPE ' + details.type + '\n' + url);
      if (url == 'img/layer-switcher-minimize.png') {
        return {
          redirectUrl: baseURL + 'js/OpenLayers-2.13.1/img/layer-switcher-minimize.png'
        };
      }
      if (url == 'img/layer-switcher-maximize.png') {
        return {
          redirectUrl: baseURL + 'js/OpenLayers-2.13.1/img/layer-switcher-maximize.png'
        };
      }
      if (url == 'img/pan.png') {
        return {
          redirectUrl: chrome.extension.getURL('img/pan.png')
        };
      }
      if (url == 'http://geo-vlaanderen.agiv.be/gdiviewer/js/OpenLayers-2.13.1/img/ZoomToBox.png') {
        return {
          redirectUrl: chrome.extension.getURL('img/ZoomToBox.png')
        };
      }
      if (details.url == 'http://geo-vlaanderen.agiv.be/gdiviewer/img/ZoomToBox.png') {
        return {
          redirectUrl: chrome.extension.getURL('img/ZoomToBox.png')
        };
      }
      if (url == 'http://geo-vlaanderen.agiv.be/gdiviewer/js/OpenLayers-2.13.1/img/ruler_square.png') {
        return {
          redirectUrl: chrome.extension.getURL('img/ruler_square.png')
        };
      }
      if (details.url == 'http://geo-vlaanderen.agiv.be/gdiviewer/img/ruler_square.png') {
        return {
          redirectUrl: chrome.extension.getURL('img/ruler_square.png')
        };
      }
      if (url == 'http://geo-vlaanderen.agiv.be/gdiviewer/js/OpenLayers-2.13.1/img/AgivLogo.jpg') {
        return {
          redirectUrl: chrome.extension.getURL('img/AgivLogo.jpg')
        };
      }
      if (details.url == 'http://geo-vlaanderen.agiv.be/gdiviewer/img/AgivLogo.jpg') {
        return {
          redirectUrl: chrome.extension.getURL('img/AgivLogo.jpg')
        };
      }
      if (details.url == 'http://geo-vlaanderen.agiv.be/gdiviewer/js/OpenLayers-2.13.1/img/layer-switcher-maximize.png') {
        return {
          redirectUrl: chrome.extension.getURL('js/OpenLayers-2.13.1/img/layer-switcher-maximize.png')
        }
      }
      if (details.url == 'http://geo-vlaanderen.agiv.be/gdiviewer/js/OpenLayers-2.13.1/img/layer-switcher-minimize.png') {
        return {
          redirectUrl: chrome.extension.getURL('js/OpenLayers-2.13.1/img/layer-switcher-minimize.png')
        }
      }
      if (details.url == 'http://grb.agiv.be/geodiensten/raadpleegdiensten/GRB-basiskaart/wms?LAYERS=GRB_BASISKAART&TRANSPARENT=FALSE&FORMAT=image%2Fpng&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG%3A31370&BBOX=238747.10016087,150000,347120.6502413,258373.55008043&WIDTH=512&HEIGHT=512') {
        return {
          redirectUrl: chrome.extension.getURL('tiles/BBOX=238747.10016087,150000,347120.6502413,258373.55008043.png')
        };
      }
      if (details.url == 'http://grb.agiv.be/geodiensten/raadpleegdiensten/GRB-basiskaart/wms?LAYERS=GRB_BASISKAART&TRANSPARENT=FALSE&FORMAT=image%2Fpng&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG%3A31370&BBOX=22000,150000,130373.55008043,258373.55008043&WIDTH=512&HEIGHT=512') {
        return {
          redirectUrl: chrome.extension.getURL('tiles/BBOX=22000,150000,130373.55008043,258373.55008043.png')
        }
      }
      if (details.url == 'http://grb.agiv.be/geodiensten/raadpleegdiensten/GRB-basiskaart/wms?LAYERS=GRB_BASISKAART&TRANSPARENT=FALSE&FORMAT=image%2Fpng&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG%3A31370&BBOX=130373.55008043,150000,238747.10016087,258373.55008043&WIDTH=512&HEIGHT=512') {
        return {
          redirectUrl: chrome.extension.getURL('tiles/BBOX=130373.55008043,150000,238747.10016087,258373.55008043.png')
        }
      }
      if (details.url == 'http://geo-vlaanderen.agiv.be/proxy88/Proxy/RegularProxy.ashx?url=http://geo.agiv.be/ogc/wms/navstreets?LAYERS=6&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&FORMAT=image%2Fjpeg&SRS=EPSG%3A31370&BBOX=22000,150000,359066.66666667,487066.66666667&WIDTH=256&HEIGHT=256') {
        return {
          redirectUrl: chrome.extension.getURL('tiles/BBOX=22000,150000,359066.66666667,487066.66666667.jpg')
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
        case 'img/help.png':
        case 'img/ruler.png':
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
          url = details.url.split('?', 2);
          if (url[0] == 'http://geo-vlaanderen.agiv.be/proxy88/Proxy/RegularProxy.ashx') {
            console.log(url[1].split('&').join('\n'));
          }
      }  
      break;
    case 'main_frame':
      //console.log('TYPE ' + details.type + '\n' + url);
      break;
    case 'other':
      console.log('TYPE ' + details.type + '\n' + url);
      if (details.url == 'http://geo-vlaanderen.agiv.be/favicon.ico') {
        return {
          redirectUrl: chrome.extension.getURL('favicon.ico')
        };
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
