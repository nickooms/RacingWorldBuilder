// show X & Y coordinates when mouse moves
function onclick(evt) {
    var a = 0;
}

function updateMousePos(evt) {

    var lonLat;

    if (evt === null) {
        lonLat = new OpenLayers.LonLat(0, 0);
    }
    else {
        if (this.lastXy == undefined || this.lastXy === null ||
                    Math.abs(evt.xy.x - this.lastXy.x) > this.granularity ||
                    Math.abs(evt.xy.y - this.lastXy.y) > this.granularity) {
            this.lastXy = evt.xy;
            return;
        }

        lonLat = map.getLonLatFromPixel(evt.xy);
        if (!lonLat) {
            // map has not yet been properly initialized
            return;
        }

        if (this.displayProjection) {
            lonLat.transform(this.getProjectionObject(),
                this.displayProjection);
        }
        this.lastXy = evt.xy;

        var digits = 3;
        if(useProjection == "Lambert")
            digits = 0;
        if (useProjection == "WGS84")
            digits = 5;
        var lblLon = Ext.getCmp("lblLon");
        if (lblLon != undefined) {
            lblLon.setText(lonLat.lon.toFixed(digits));
        }

        var lblLat = Ext.getCmp("lblLat");
        if (lblLat != undefined) {
            lblLat.setText(lonLat.lat.toFixed(digits));
        }

    }
}

// the part below is just to make the bounds show up on the page
function updateBounds() {

    var crsNamesToLabels = new Object(); // It is not an array!
    crsNamesToLabels["EPSG:4326"] = "WGS84";
    crsNamesToLabels["CRS:84"] = "WGS84";
    crsNamesToLabels["EPSG:3035"] = "ETRS-LAEA";
    crsNamesToLabels["EPSG:3034"] = "ETRS-LCC";
    crsNamesToLabels["EPSG:4258"] = "ETRS89";

    var proj = Ext.getCmp("lblProjection");
    if (proj != undefined) {
        var curProj = map.getProjection();
        if (crsNamesToLabels[curProj] != undefined) {
            curProj = crsNamesToLabels[curProj];
        }
        proj.setText(curProj);
    }
    try {
        var digits = 3;
        if (useProjection == "Lambert")
            digits = 0;
        if (useProjection == "WGS84")
            digits = 5;
        cX.setValue(mapPanel.map.center.lon.toFixed(digits));
        cY.setValue(mapPanel.map.center.lat.toFixed(digits));
    }catch(ex)
    {
    }
}

// update zoom values
function zoomEnd() {
    var scale = scaleStore.queryBy(function (record) {
        return this.map.getZoom() == record.data.level;
    });

    if (scale.length > 0) {
        scale = scale.items[0];
        zoomSelector.setValue("1 : " + Math.round(parseFloat(scale.data.scale)));
    } else {
        if (!zoomSelector.rendered) return;
        zoomSelector.clearValue();
    }
    updateWMSLayerList();
}

function changelayer(evt) {
    var l = map.layers;
    map.setLayerIndex(map.getLayersByName('Vector')[0], map.getNumLayers() - 1);
    updateWMSLayerList();
}

function addlayer(evt) {
    var l = map.layers;
    map.setLayerIndex(map.getLayersByName('Vector')[0], map.getNumLayers() - 1);
    updateWMSLayerList();
}

// update zoom values
function updateWMSLayerList() {
    var scale = scaleStore.queryBy(function (record) {
        return this.map.getZoom() == record.data.level;
    });

    if (scale.length > 0) {
        scale = scale.items[0];
        
    } 
    try {
        var wmsnodes = layerPanel.root.childNodes[0].childNodes;
        for (var i = 0; i < wmsnodes.length; i++) {
            var wmsnode = wmsnodes[i];
            if ((scale.data.scale < wmsnode.layer.maxScale) || (scale.data.scale > wmsnode.layer.minScale)) {
                wmsnode.disable();
                //wmsnode.getUI().checkbox.disabled = true;
            } else {
                wmsnode.enable();
                //wmsnode.getUI().checkbox.disabled = false;
            }
        }
    } catch (ex) {
    }
}