


if (useProjection == "Lambert") {
    var lyr_GRBSEL = 'grb_sel@BPL72VL'
    var lyr_GRBBSK = 'grb_bsk@BPL72VL'
    var lyr_LUCHTFOTO = 'orthoklm@BPL72VL'
    var tileOrigin = new OpenLayers.LonLat(9928, 66928);
}
if (useProjection == "WGS84") {
    var lyr_GRBSEL = 'grb_sel@WGS84VL'
    var lyr_GRBBSK = 'grb_bsk@WGS84VL'
    var lyr_LUCHTFOTO = 'orthoklm@WGS84VL'
    //var tileOrigin = new OpenLayers.LonLat(2.5, 49.25);
    var tileOrigin = new OpenLayers.LonLat(-180, -90);
}


var GRBSEL_tms_layer = new OpenLayers.Layer.TMS("GRB-Selectie BPL72-TMS",
        "http://grb.agiv.be/geodiensten/raadpleegdiensten/geocache/tms/",
        { layername: lyr_GRBSEL, type: "png", serviceVersion: "1.0.0",
            gutter: 0, buffer: 2, isBaseLayer: false, opacity: 0.6,
            tileOrigin: tileOrigin,
            resolutions: resolutions,
            units: map_units,
            maxExtent: map_maxExtent,
            projection: map_projection,
            sphericalMercator: false
        }
    );



var GRBBSK_tms_layer = new OpenLayers.Layer.TMS("GRB",
        "http://grb.agiv.be/geodiensten/raadpleegdiensten/geocache/tms/",
        { layername: lyr_GRBBSK, type: "png", serviceVersion: "1.0.0",
            gutter: 0, buffer: 2, isBaseLayer: false, transitionEffect: 'resize',
            tileOrigin: tileOrigin,
            resolutions: resolutions,
            units: map_units,
            maxExtent: map_maxExtent,
            projection: map_projection,
            sphericalMercator: false
        }
    );

var LUCHTFOTO_tms_layer = new OpenLayers.Layer.TMS("Luchtfoto",
        "http://grb.agiv.be/geodiensten/raadpleegdiensten/geocache/tms/",
        { layername: lyr_LUCHTFOTO, type: "png", serviceVersion: "1.0.0",
            gutter: 0, buffer: 0, isBaseLayer: false, transitionEffect: 'resize',
            tileOrigin: tileOrigin,
            resolutions: resolutions,
            units: map_units,
            maxExtent: map_maxExtent,
            projection: map_projection,
            sphericalMercator: false,
            transitionEffect: 'resize'
        }
    );


    




function startpublieksviewer() {
    //LUCHTFOTO_BPL72_tms_layer,GRBSEL_BPL72_tms_layer, GRBBSK_BPL72_tms_layer
    map.addLayer(LUCHTFOTO_tms_layer);
    map.addLayer(GRBSEL_tms_layer);
    map.addLayer(GRBBSK_tms_layer);

    topToolbar = mapPanel.toolbars[0];
    topToolbar.add(new Ext.Toolbar.Spacer({ width: 5 }));
    topToolbar.add("-");
    orthofoto_aanuit = {
        xtype: 'checkbox',
        id: 'orthofoto_aanuit_chkbx',
        fieldLabel: "",
        boxLabel: 'Orthofoto',
        inputValue: 'a'
        ,checked:true
        , listeners: {
            check: {
                fn: function () {
                    if (Ext.getCmp('orthofoto_aanuit_chkbx').checked) {
                        mapPanel.map.layers[1].setVisibility(true);
                        mapPanel.map.layers[2].setVisibility(true);
                    } else {
                        mapPanel.map.layers[1].setVisibility(false);
                        mapPanel.map.layers[2].setVisibility(false);
                    }
                }
            }
        }
    };
    topToolbar.add(orthofoto_aanuit);
    topToolbar.add("-");

    var opaslider = {
        
        xtype: "gx_opacityslider",
        fieldLabel: 'test',
        layer: mapPanel.map.layers[3],
        changevisibility: false,
        aggressive: true,
        vertical: false,
        width: 140,
        value: 100,
        plugins: new GeoExt.LayerOpacitySliderTip({ template: "Opaciteit: {opacity}%" }),
        scope: this
    };

    topToolbar.add(opaslider);
    topToolbar.add("-");
    grb_aanuit = {
        xtype: 'checkbox',
        id: 'grb_aanuit_chkbx',
        fieldLabel: "",
        boxLabel: 'GRB',
        inputValue: 'a'
        , checked: true
        , listeners: {
            check: {
                fn: function () {
                    if (Ext.getCmp('grb_aanuit_chkbx').checked) {
                        mapPanel.map.layers[3].setVisibility(true);
                    } else {
                        mapPanel.map.layers[3].setVisibility(false);
                    }
                }
            }
        }
    };
    topToolbar.add(grb_aanuit);
    
}