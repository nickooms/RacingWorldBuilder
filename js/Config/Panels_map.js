var map, mapPanel;
var navHistory;
var scaleStore, zoomSelector;
var wmsfeatureinfo;
var length;
var area;
// define standard layers
// - base layers
var agivStreets = new OpenLayers.Layer.WMS("Stratenplan", OpenLayers.ProxyHost + urlStreets, { layers: '1,2,3,4,5,6', transparent: false, format: 'image/png', tiled: true }, { isBaseLayer: true, transitionEffect: 'resize' });
var agivOrtho = new OpenLayers.Layer.WMS("Luchtfoto", OpenLayers.ProxyHost + urlOrtho, { layers: 'ortho', transparent: false, format: 'image/png', tiled: true }, { isBaseLayer: true , transitionEffect : 'resize' });
//var agivOrtho = new OpenLayers.Layer.WMS("Luchtfoto", urlOrtho, { layers: '0,1,2,3,4', transparent: false, format: 'image/png', tiled: true }, { isBaseLayer: true, transitionEffect: 'resize' });
//var agivGRB = new OpenLayers.Layer.WMS("GRB (zichtbaar vanaf 1:20000)", OpenLayers.ProxyHost + urlGRB, { layers: '1,2,3,4,5,6,7,8,9,11,12,14,15,16,17', transparent: false, format: 'image/png' }, { isBaseLayer: true });

var agivGem = new OpenLayers.Layer.WMS("Gemeenten", OpenLayers.ProxyHost + urlGem, { layers: '3', transparent: false, format: 'image/png' }, { isBaseLayer: false });
var agivGeen = new OpenLayers.Layer.Vector("Geen achtergrondlaag", { isBaseLayer: true });
var agivGRB = new OpenLayers.Layer.WMS("GRB", urlGRB, { layers: 'GRB_BASISKAART', transparent: false, format: 'image/png' }, { isBaseLayer: true, transitionEffect: 'resize' });
var agivGRBgr = new OpenLayers.Layer.WMS("GRB (grijs)", OpenLayers.ProxyHost + urlGRBgr, { layers: 'GRB_BASISKAART', transparent: false, format: 'image/png' }, { isBaseLayer: true, transitionEffect: 'resize' });

//"http://gisservices.inbo.be/ArcGIS/rest/services/Orthofoto/MapServer/export",
//var agivOrtho = new OpenLayers.Layer.ArcGIS93Rest("MyName",
//                                   "http://aocsrv18/ArcGIS/rest/services/Orthoklm/MapServer/export",
//                                   {
//                                       layers: "0,1,2"
//                                   });


var wfslayer = new OpenLayers.Layer.Vector("States", {
    strategies: [new OpenLayers.Strategy.Fixed()],
    protocol: new OpenLayers.Protocol.WFS.v1_0_0({
        version: "1.0.0",
        srsName: "EPSG:31370", // this is the default
        url: proxyUrlWFS + "http://wms.agiv.be/ogc/wfs/vrbg",
        featureType: "Refgew",
        featurePrefix: "vrbg",
        geometryName: "SHAPE"
    })
});

// - vector layer (for drawing)
var vecLayer = new OpenLayers.Layer.Vector("Vector");
// array with active layers
if (issimple)
    var aMapLayers = [agivGeen, vecLayer];
else{
    var aMapLayers = [agivGRB, agivGRBgr, agivStreets, agivOrtho, agivGeen, vecLayer];
}
Ext.onReady(function() {

    Ext.QuickTips.init();
    OpenLayers.DOTS_PER_INCH = 96;

    // define map object
    map = new OpenLayers.Map('map'
        , {
            units: map_units,
            displayProjection: map_projection,
            projection: map_projection,
            maxExtent: map_maxExtent,
            scales: scales,
            resolutions: resolutions,
            layers: aMapLayers
            , allOverlays: false
	    , controls: []
        }
    );
    // set tilesizes
    agivStreets.setTileSize(new OpenLayers.Size(baseLayerTileSize, baseLayerTileSize));
    agivStreets.buffer = baseLayerBuffer;
    agivOrtho.setTileSize(new OpenLayers.Size(baseLayerTileSize, baseLayerTileSize));
    agivOrtho.buffer = baseLayerBuffer;
    agivGem.setTileSize(new OpenLayers.Size(baseLayerTileSize, baseLayerTileSize));
    agivGem.buffer = baseLayerBuffer;
    agivGRBgr.setTileSize(new OpenLayers.Size(baseLayerTileSize, baseLayerTileSize));
    agivGRBgr.buffer = baseLayerBuffer;
    agivGRB.setTileSize(new OpenLayers.Size(baseLayerTileSize, baseLayerTileSize));
    agivGRB.buffer = baseLayerBuffer;
    

    // register history (for history buttons in top toolbar)
    navHistory = new OpenLayers.Control.NavigationHistory();
    map.addControl(navHistory);

    // generate toolbars - see Map_toolbars.js
    var topToolbarItems = GenerateTopToolbar();
    var bottomToolbarItems = GenerateBottomToolbar();


    if (useZoomSlider)
        var zoomslider = [{
            xtype: "gx_zoomslider",
            aggressive: false,
            vertical: true,
            height: 110,
            x: 18,
            y: 85,
            plugins: new GeoExt.ZoomSliderTip({
                template: "Schaal: 1 : {scale}<br>Resolutie: {resolution}"
            })
        }];
    else
        zoomslider = [];

    // define map panel
    mapPanel = new GeoExt.MapPanel({
        map: map
        , region: "center"
        //, title: "Kaart"
        , renderto: "mappanel"
        , tbar: topToolbarItems
        , bbar: bottomToolbarItems
        , items: zoomslider
    });

    // register events - see Map_events.js for function details
    map.events.register('moveend', map, updateBounds);
    map.events.register('mousemove', map, updateMousePos);
    map.events.register('zoomend', map, zoomEnd);
    map.events.register('addlayer', map, addlayer);
    map.events.register('changelayer', map, changelayer);
    map.events.register('click', map, onclick);

    // add some controls






    ctrlScaleLine = new OpenLayers.Control.ScaleLine({ bottomInUnits: '', bottomOutUnits: '', maxWidth: 250 });
    map.addControl(ctrlScaleLine);
    if (useNavigation) {
        ctrlNavigation = new OpenLayers.Control.Navigation({ dragPanOptions: { enableKinetic: true} })
        map.addControl(ctrlNavigation);
    }
    if (usePanPanel) {
        ctrlPanPanel = new OpenLayers.Control.PanPanel()
        map.addControl(ctrlPanPanel);
    }
    if (useZoomPanel) {
        ctrlZoomPanel = new OpenLayers.Control.ZoomPanel()
        map.addControl(ctrlZoomPanel);
    }
    if (useOverviewMap) {
        ctrlOverviewMap = new OpenLayers.Control.OverviewMap(
                { autoPan: true,
                    layers: [new OpenLayers.Layer.WMS("OverviewMap", OpenLayers.ProxyHost + urlStreets,
                    { layers: '6' }, { units: map_units
            , projection: map_projection
            , maxExtent: map_maxExtent
                    })]
                , minRatio: 10000
                , maxRatio: 10000
                }
                );
        map.addControl(ctrlOverviewMap);
    }
    if (useMeasure) {
        length = new OpenLayers.Control.Measure(OpenLayers.Handler.Path, {
            eventListeners: {
                measure: function (evt) {
                    lengteField.setRawValue(Math.round(evt.measure * 100) / 100 + " " + evt.units);
                },
                measurepartial: function (evt) {
                    lengteField.setRawValue(Math.round(evt.measure * 100) / 100 + " " + evt.units);
                }
            }
    , persist: true
    , immediate: true
    , handler: {
        style: {
            strokeColor: '#FF0000'
        }
    }
            //    , handlerOptions: {
            //        layerOptions: {
            //            renderers: renderer,
            //            styleMap: styleMap
            //        }

            //    }

        });

        area = new OpenLayers.Control.Measure(OpenLayers.Handler.Polygon, {
            eventListeners: {
                measure: function (evt) {
                    oppField.setRawValue(Math.round(evt.measure * 100) / 100 + " " + evt.units + "\xb2");
                },
                measurepartial: function (evt) {
                    oppField.setRawValue(Math.round(evt.measure * 100) / 100 + " " + evt.units + "\xb2");
                }
            }
    , persist: true
    , immediate: true
            //    , handlerOptions: {
            //        layerOptions: {
            //            renderers: renderer,
            //            styleMap: styleMap
            //        }

            //    }

        });
        map.addControl(length);
        map.addControl(area);
    }
    //if (useInfo) {
    // object to be used by Info tool
    wmsfeatureinfo = new OpenLayers.Control.WMSGetFeatureInfo({
        url: urlStreets,
        title: 'Identificeer',
        queryVisible: true,
        vendorParams: {
            buffer:50,
            usr: '',
            pwd: ''
        },
        infoFormat: 'text/html',

        eventListeners: {
            getfeatureinfo: function (event) {
                if (usemobilemapping && (wmsfeatureinfo.url.indexOf(urlMM)> (-1))) {
                    getfeatureinfoMM(event);
                } else {
                    if (event && event.text && event.text.length > 0) {
                        map.addPopup(new OpenLayers.Popup.FramedCloud(
                    'infopopup',
                    map.getLonLatFromPixel(event.xy),
                    null,
                    event.text,
                    null,
                    true
                ));
                    }
                }
                
            }
        }
    });
    map.addControl(wmsfeatureinfo);
    //}
    // start map zoomed to extent of Flanders

    mapPanel.map.zoomToExtent(map_maxExtent);

});
