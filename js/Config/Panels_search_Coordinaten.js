var text = "";

if (useCoordinatenPanel)

    Ext.onReady(function () {


        

        removeLocationButton = new Ext.Button({
            //text: 'Verwijder straat/huisnr/perceel',
            tooltip: 'Verwijder straat/huisnr/perceel',
            iconCls: "btnCross",
            handler: function () {

                removeLocation();
            }
        });

       


        coordinatenSetButton = new Ext.Button({
            //text: 'Pan',
            tooltip: 'Pan',
            iconCls: "btnPan",
            handler: function () {

                coordinatenSet();
            }
        });

        cX = new Ext.form.TextField(
    {
        name: 'xxx'
        , fieldLabel: 'X'

    });
        cY = new Ext.form.TextField(
    {
        name: 'yyy'
        , fieldLabel: 'Y'
    });

        coordinatenPanel = new Ext.FormPanel({
            title: 'Zoek op coördinaat'
        , id: 'crdnts'
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
                        , items: [cX]
                    },
                    {

                        layout: 'form'
                        , colspan: 2
                        , border: false
                        , items: [cY]
                    },
                    {
                        // have buttons shown next to each other
                        layout: 'column'
                        , border: false
                        , items: [coordinatenSetButton, removeLocationButton]
                    }
                 ]
            //        , tbar: new Ext.ux.StatusBar({
            //            id: 'coordinaten-statusbar',
            //            defaultText: 'Klaar',
            //            defaultIconCls: ''
            //        })
        });

                if (issimple) {
                    coordinatenPanel.collapsible = false;
                    coordinatenPanel.collapsed = false;
                }
        function coordinatenGet() {
            cX.setValue(Math.round(mapPanel.map.center.lon));
            cY.setValue(Math.round(mapPanel.map.center.lat));

        }
        function coordinatenSet() {
            mapPanel.map.setCenter(new OpenLayers.LonLat(cX.getValue(), cY.getValue()), mapPanel.map.zoom);
            var feature = new OpenLayers.Feature.Vector(
                                new OpenLayers.Geometry.Point(cX.getValue(), cY.getValue()),
                                { some: 'data' },
                                { externalGraphic: 'img/pin.png', graphicHeight: 21, graphicWidth: 16 });
            vecLayer.addFeatures(feature);

        }

        function removeLocation() {
            for (var i = vecLayer.features.length - 1; i >= 0; i--) {
                if (vecLayer.features[i].state == null) {
                    //vecLayer.features.remove(vecLayer.features[i]);
                    var a = new Array();
                    a[0] = vecLayer.features[i];
                    vecLayer.removeFeatures(a, null);
                }
            }
            vecLayer.refresh();

        }
    });