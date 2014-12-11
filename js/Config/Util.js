
Ext.onReady(function () {


    schrijfButton = new Ext.Button({
        text: 'schrijf wmc',
        tooltip: 'schrijf wmc',
        handler: function () {
            var format = new OpenLayers.Format.WMC(); //{ 'layerOptions': { buffer: 0} }
            try {
                text = format.write(map);
                //document.getElementById("wmc").value = text;
            } catch (err) {
                //document.getElementById("wmc").value = err;
            }
        }
    });

    leesButton = new Ext.Button({
        text: 'lees wmc',
        tooltip: 'lees wmc',
        handler: function () {
            var format = new OpenLayers.Format.WMC({ 'layerOptions': { buffer: 0} });
            try {
                mapx = new OpenLayers.Map('mapx');
                mapx = format.read(text, { map: mapx });

//                for (var key in map.layers) {
//                    layer = map.layers[key];
//                    if (!layer.isBaseLayer && layer.CLASS_NAME != "OpenLayers.Layer.Vector" && layer.isBaseLayer != undefined)
//                        map.layers.remove(layer);
                //                }
                var wmsnodes = layerPanel.root.childNodes[0].childNodes;
                //for (var i = 0; i < wmsnodes.length; i++) {
                while (wmsnodes.length > 0) {
                    var wmsnode = wmsnodes[0];
                    var layer = wmsnode.layer;
                    var store = wmsnode.layerStore;
                    var record = store.getAt(store.findBy(function (record) {
                        return record.get("layer") === layer;
                    }));
                    store.remove(record);
                }
                for (var key in mapx.layers) {
                    layer = mapx.layers[key];
                    if (!layer.isBaseLayer && layer.CLASS_NAME != "OpenLayers.Layer.Vector" && layer.isBaseLayer != undefined) {
                        wmsCapStore_auto.removeAll();
                        wmsCapStore_auto.baseParams = { url: layer.url.replace(OpenLayers.ProxyHost,""), request: 'GetCapabilities', layer: layer.params.LAYERS,opacity:layer.opacity };
                        wmsCapStore_auto.load();
                    }
                }
                var data = OpenLayers.Format.XML.prototype.read.apply(this, [text]);
                var context = findChildByName(data, 'ViewContext');
                var general = findChildByName(context,'General'); 
         if(general){ 
             var bbox = findChildByName(general,'BoundingBox'); 
             var minx = bbox.getAttribute('minx'); 
             var miny = bbox.getAttribute('miny'); 
             var maxx = bbox.getAttribute('maxx'); 
             var maxy = bbox.getAttribute('maxy'); 
             var srs = bbox.getAttribute('SRS');


             var bounds = new OpenLayers.Bounds.fromArray([minx, miny, maxx, maxy]);
             map.zoomToExtent(bounds);
         } 



                
            } catch (err) {
                //document.getElementById("wmc").value = err;
            }
        }
    });

    function findChildByName(n,name) { 
         if(!n)return false; 
         var x = n.firstChild; 
         while (x) 
         { 
             if(x.nodeName==name) return x; 
             else if(x==n.lastChild)return null; 
             else x=x.nextSibling; 
         } 
     }


    testButton = new Ext.Button({
        tooltip: 'test',
        iconCls: "btnPan",
        handler: function () {
            doTest();
        }
    });

    cXTest = new Ext.form.TextField({
        name: 'xxx'
            , fieldLabel: 'X'

    });
    cYTest = new Ext.form.TextField({
        name: 'yyy'
            , fieldLabel: 'Y'
    });

    testPanel = new Ext.FormPanel({
        title: 'Testen maar'
            , id: 'testpanelform'
            , layout: 'form'
            , anchor: '100%'
            , height: 200
            , width: 200
            , bodyStyle: 'padding:5px'
            , border: false
            , collapsible: true
            , collapsed: true
            , items: [
                    {

                        layout: 'form'
                        , colspan: 2
                        , border: false
                        , items: [cXTest]
                    },
                    {

                        layout: 'form'
                        , colspan: 2
                        , border: false
                        , items: [cYTest]
                    },
                    {
                        layout: 'column'
                        , border: false
                        , items: [testButton, schrijfButton, leesButton]
                    }
                 ]
    });

    function doTest() {
        //            mapPanel.map.setCenter(new OpenLayers.LonLat(cX.getValue(), cY.getValue()), mapPanel.map.zoom);
        //            var feature = new OpenLayers.Feature.Vector(
        //                                new OpenLayers.Geometry.Point(cX.getValue(), cY.getValue()),
        //                                { some: 'data' },
        //                                { externalGraphic: 'img/pin.png', graphicHeight: 21, graphicWidth: 16 });
        //            vecLayer.addFeatures(feature);
        var scales = [];
        var resolutions = mapPanel.map.resolutions;
        for (var i = 0; i < resolutions.length; i++) {
            scales.push(OpenLayers.Util.getScaleFromResolution(resolutions[i], map_units));
        }
    }

});
    