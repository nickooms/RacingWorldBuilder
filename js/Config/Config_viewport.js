var mainPanel, legendPanel, dataPanel, layerPanel, searchPanel, capasearchPanel, coordinatenPanel,logoPanel,tree, wmsCapStore_auto;

Ext.onReady(function () {

    /******************************************
    *   logo    *                             *
    *************                             *
    *  layers   *                             *
    *************             map             *
    *  location *                             *
    *************                             *
    *  legend   *                             *
    ******************************************/

    // logo
    logoPanel = new Ext.Panel({
        border: false
        , height: heightLogoPanel
        , collapsible: false
        , items: [{ xtype: 'image', id: 'agivLogo', src: 'img/AgivLogo.jpg', align: 'center', style: 'margin-left: 50px'}]
    });

    // layers: see Panels_layers.js

    // location: see Panels_search.js

    // legend
    legendPanel = new GeoExt.LegendPanel({
        title: titleLegendPanel
            , border: false
            , padding: 20
	        , scrollable: true
            , region: 'south'
            , collapsible: true
            , split: true
            , height: heightLegendPanel
            , ascending: false
            , autoScroll: true

            , map: mapPanel.map
        //            , baseParams: {
        //                //format: 'image/gif',
        //                LEGEND_OPTIONS: 'forceLabels:on'
        //            }

            , useScaleParameter: false
            , defaults: { cls: 'legend-item' }
            , filter: function (record) {
                if (record.get("layer").isBaseLayer)
                    return false;
                if (record.get("layer").name == 'Vector')
                    return false;
                if (record.get("layer").name == undefined)
                    return false;
                //if (!record.data.queryable)
                //    return false;
                return true;
            }
    });
    //Ext.applyIf(params, { FORMAT: 'image/gif' }); in geoExt aangepast om geen png EN gif te vragen voor de wmslegende met getlegendgraphic



    // map: see Panels_map.js

    // entire left side

    //items dataPanel toevoegen op basis van Configuratie

        var dataPanelItems = [logoPanel];
    if (useLayerPanel)
        dataPanelItems[dataPanelItems.length] = layerPanel;
    if (useSearchPanel)
        dataPanelItems[dataPanelItems.length] = searchPanel;
    if (useCapasearchPanel)
        dataPanelItems[dataPanelItems.length] = capasearchPanel;
    if (useCoordinatenPanel)
        dataPanelItems[dataPanelItems.length] = coordinatenPanel;
    if (useLegendPanel)
        dataPanelItems[dataPanelItems.length] = legendPanel;
    if (usenewlayertree)
        dataPanelItems[dataPanelItems.length] = tree;
    if(Iamdeveloping)
        dataPanelItems[dataPanelItems.length] = testPanel;
    dataPanel = new Ext.Panel({
        region: 'west'
        , layout: 'anchor'
	    , collapsible: true
        //, anchorSize: { width: widthDataPanel, height: '100%' }
        , width: widthDataPanel
        , items: dataPanelItems

        //, items: [logoPanel, layerPanel, searchPanel, capasearchPanel, coordinatenPanel, legendPanel]
         , listeners: {
             collapse: {
                 fn: function () {
                     mapPanel.tbar.hide(false);
                     mapPanel.bbar.hide(false);
                 }
             },
             expand: {
                 fn: function () {
                     mapPanel.tbar.show(false);
                     mapPanel.bbar.show(false);
                 }
             }
         }
    });

    // total user interface

    wmsCapStore_auto = new GeoExt.data.WMSCapabilitiesStore({
        reader: new GeoExt.data.WMSCapabilitiesReader()
        , url: proxyUrl
        , listeners: {
            load: {
                fn: function (proxy, o, options) {
                    wmsCapStore_auto.filter("name", options.params.layer);
                    if (wmsCapStore_auto.getCount() == 1) {
                        layer = wmsCapStore_auto.getAt(0);
                        var clone = layer.clone();
                        clone.get("layer").mergeNewParams({
                            format: "image/png",
                            transparent: true
                       , isBaseLayer: false
                        });
                        clone.get("layer").setTileSize(new OpenLayers.Size(wmsLayerTileSize, wmsLayerTileSize));  // bigger, faster, stronger
                        clone.get("layer").buffer = wmsLayerBuffer;
                        clone.get("layer").url = OpenLayers.ProxyHost + clone.get("layer").url + "?"; // set the url to the service with first access

                        var realminscale;
                        var realmaxscale;
                        if (clone.get("layer").minScale == null || clone.get("layer").minScale == 0) {
                            realminscale = Math.round(map.scales[0]);
                        } else {
                            for (var ii = 0; ii < map.scales.length; ii++) {
                                if (clone.get("layer").minScale >= map.scales[ii]) {
                                    realminscale = Math.round(map.scales[ii]);
                                    break;
                                }
                            }
                        }
                        if (clone.get("layer").maxScale == null || clone.get("layer").maxScale == 0) {
                            realmaxscale = Math.round(map.scales[map.scales.length - 1]);
                        } else {
                            for (var ii = map.scales.length - 2; ii >= 0; ii--) {
                                if (clone.get("layer").maxScale <= map.scales[ii]) {
                                    realmaxscale = Math.round(map.scales[ii]);
                                    break;
                                }
                            }
                        }
                        clone.get("layer").mergeNewParams({
                            realminscale: realminscale
               , realmaxscale: realmaxscale
                        });

                        clone.get("layer").opacity = options.params.opacity;
                        mapPanel.layers.add(clone);

                    }
                }
            }
            , exception: {
                fn: function (proxy, type, action, options, response, arg) {
                }
            }
        }
    });




    mainPanel = new Ext.Viewport({
        layout: "border"
           , renderTo: "mainpanel"
           , items: [mapPanel, dataPanel]
        , listeners: {
            afterrender: {
                fn: function () {
                    //if (issimple) { agivGRB.isBaseLayer = false; agivGRB.opacity = 0.8; }

                    if (issimple) {
                        startpublieksviewer();
                        //laadWMS_auto('http://grb.agiv.be/GRB-raadpleegdienst/wms?', 'GRB_BASISKAART');
                        //                        wmsCapStore_auto.removeAll();
                        //                        wmsCapStore_auto.baseParams = { url: 'http://grb.agiv.be/GRB-raadpleegdienst/wms?', request: 'GetCapabilities', layer: 'GRB_BASISKAART' };
                        //                        wmsCapStore_auto.load();
                    }
                    if (param_zoom != 0 && param_lon != 0 && param_lat != 0) {
                        mapPanel.map.setCenter(new OpenLayers.LonLat(param_lon, param_lat), param_zoom);
                    }
                    if (laadhydrografie) {
                        var hydrostore = new Ext.data.Store({
                            proxy: new Ext.data.HttpProxy({
                                url: 'xml/hydrografie.xml',
                                method: 'GET'
                            })
                            , autoLoad: true
                            , reader: new Ext.data.XmlReader({
                                record: 'service'
                                , fields: ['url', 'laag']
                            })
                        });
                        hydrostore.on('load', function (store, records, options) {
                            for (var key in records) {
                                record = records[key];
                                if (record.data == undefined) break;
                                laadWMS_auto(record.data.url, record.data.laag);
                            }
                        });
                    }
                    if (usemobilemapping) {
                        startmobilemapping();
                    }
                }
            }
        }
    });

    function laadWMS_auto(url, layer) {
        wmsCapStore_auto.removeAll();
        wmsCapStore_auto.baseParams = { url: url, request: 'GetCapabilities', layer: layer };
        wmsCapStore_auto.load();
    }










});

