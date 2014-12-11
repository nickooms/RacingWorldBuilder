
/************************
**  Show info message  **
************************/
function msg(title, msg) {
    Ext.Msg.show({
        title: title,
        msg: msg,
        minWidth: 200,
        modal: true,
        icon: Ext.Msg.INFO,
        buttons: Ext.Msg.OK
    });
};

/********************
**  Configuration  NIET GEIMPLEMENTEERD!!!!!!!!**
********************/

// save configuration to cookie
function SaveConfiguration() {
    var cookievalue = '';

    // get added wms layers
    var wmslayers = mapPanel.layers.queryBy(function (record, id) { return record.get("layer").CLASS_NAME.indexOf("WMS") > -1 && !record.get("layer").isBaseLayer; });
    var count = wmslayers.getCount();
    if (count > 0) {
        cookievalue += 'wms,';
        for (i = 0; i < count; i++) {
            cookievalue += Ext.util.JSON.encode(wmslayers.itemAt(i).data);  // werkt niet! Een layer blijkt te complex om te serializeren... ("too much recursion")
            if (i < count - 1) { cookievalue += ','; }
        }
        cookievalue += ';';
    }

    // TODO: get wmsSourcesStore?
    // TODO: get current zoom values?

    // save cookie
    Set_Cookie('mapconfig', cookievalue, '', '/', '', '');
    if (Get_Cookie('mapconfig')) {
        msg('Configuratie bewaren', 'Configuratie is bewaard.\n\n' + cookievalue);
    }
    else {
        msg('Configuratie bewaren', 'Configuratie is NIET bewaard.\n\nZijn cookies uitgeschakeld in uw browser?');
    }
}

// load configuration from cookie
function LoadConfiguration() {
    var cookievalue = Get_Cookie('mapconfig');
    if (cookievalue) {
        // TODO: load settings from cookie
        msg('Configuratie inladen', 'Configuratie is ingeladen.');
    }
    else {
        msg('Configuratie inladen', 'Geen configuratie gevonden...');
    }
}


/***********************
**  Set Layer Active  **
***********************/

function SetLayerActive(layer, usr, pwd) {
    wmsfeatureinfo.url = layer.url;
    wmsfeatureinfo.vendorParams.usr = usr;
    wmsfeatureinfo.vendorParams.pwd = pwd;
    if(layer=="")
        mapPanel.getBottomToolbar().get('lblInfo').setText("");
    else
        mapPanel.getBottomToolbar().get('lblInfo').setText(layer.name + " (Schaalrange " + layer.params.REALMAXSCALE + " - " + layer.params.REALMINSCALE + ")");
    layerPanel.contextMenu.items.items[1].layer = layer;
}


/********************
**   Help Window   **
********************/

function ShowHtmlWindow(url, title, width, height) {
    var htmlWindow = new Ext.Window({
        id: 'HtmlWindow',
        title: title,
        width: width,
        height: height,
        collapsible: true,
        shadow: false,  // there's a bug in ExtJs that will keep the shadow if you open another window or menu while this window is open
        autoScroll: true,
        autoLoad: url
    });

    htmlWindow.show();
}


/**********************
**   Export Vector   **
**********************/

// function used to make an ajax call
Ext.util.downloadFile = function (url, body, completedCallback) {
    // create hidden target iframe
    var id = Ext.id();
    var frame = document.createElement('iframe');
    frame.id = id;
    frame.name = id;
    frame.className = 'x-hidden';
    frame.src = Ext.SSL_SECURE_URL;

    document.body.appendChild(frame);

    if (Ext.isIE) {
        document.frames[id].name = id;
    }

    var form = Ext.DomHelper.append(document.body, {
        tag: 'form',
        method: 'post',
        action: url,
        target: id
    });

    Ext.DomHelper.append(form, { tag: 'input', name: 'body', value: body, type: 'hidden' });

    document.body.appendChild(form);

    var callback = function (e) {

        var rstatus = Ext.isIE ? this.readyState : e.type;

        switch (rstatus) {
            case 'interactive':
            case 'loading':  // IE has several readystate transitions, ignore these
                break;

            case 'complete': // IE readyState == done
            case 'load': // Gecko, Opera, others == done

                var fnCleanup = function () {
                    if (Ext.isIE) {
                        this.src = "javascript:false"; // cleanup
                    }

                    Ext.fly(this).remove();  // kill frame
                    Ext.fly(form).remove(); // kill form
                };

                if (completedCallback && typeof (completedCallback) === "function") {
                    // Call callback function if specified
                    Ext.callback(completedCallback, null, [this]);
                }

                // 'this' refers to the frame object, ie. the dom object not the Ext element
                fnCleanup.defer(200, this);
                break;

            default:
                break;
        }
    };

    frame[Ext.isIE ? 'onreadystatechange' : 'onload'] = callback.createDelegate(frame);

    form.submit();
};

function ExportVectorLayer() {
    if (vecLayer.features.length == 0) {
        msg('Exporteer vector laag', 'De vector laag is leeg');
    }
    else {

        var gml = new OpenLayers.Format.GML();
        /**/
        var projCode = vecLayer.projection.projCode;
        var minx = 999999;
        var miny = 999999;
        var maxx = 0;
        var maxy = 0;
        for (var i = 0; i < vecLayer.features.length; i++) {
            var b = vecLayer.features[i].geometry.bounds;
            if (minx > b.left) minx = b.left;
            if (maxx < b.right) maxx = b.right;
            if (miny > b.bottom) miny = b.bottom;
            if (maxy < b.top) maxy = b.top;
        }
        //var gmlTxt = '<?xml version="1.0" encoding="utf-8"?>';
        var gmlTxt = '';
        gmlTxt += '<agiv:FeatureCollection xmlns:gml="http://www.opengis.net/gml"';
        gmlTxt += ' xmlns:agiv="http://www.agiv.be/agiv"';
        gmlTxt += ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';
        gmlTxt += ' xsi:schemaLocation="http://www.agiv.be/agiv http://gditestbed.agiv.be/XSD/GeneriekeViewer.xsd">';
        gmlTxt += '<gml:boundedBy>';
        gmlTxt += '<gml:Box srsName="' + projCode + '">';
        gmlTxt += '<gml:coordinates>' + minx + ',' + miny + ' ' + maxx + ',' + maxy + '</gml:coordinates>';
        gmlTxt += '</gml:Box>';
        gmlTxt += '</gml:boundedBy>';
        for (var i = 0; i < vecLayer.features.length; i++) {
            var g = vecLayer.features[i].geometry;
            gmlTxt += '<gml:featureMember>';
            gmlTxt += '<agiv:GV_Feature>';
            if (g.CLASS_NAME == "OpenLayers.Geometry.Point") {
                gmlTxt += '<gml:pointProperty>';
                gmlTxt += '<gml:Point srsName="' + projCode + '">';
                gmlTxt += '<gml:coordinates decimal="." cs="," ts=" ">' + g.x + ',' + g.y + '</gml:coordinates>';
                gmlTxt += '</gml:Point>';
                gmlTxt += '</gml:pointProperty>';
            }
            else if (g.CLASS_NAME == "OpenLayers.Geometry.LineString") {
                gmlTxt += '<gml:lineStringProperty>';
                gmlTxt += '<gml:LineString srsName="' + projCode + '">';
                gmlTxt += '<gml:coordinates decimal="." cs="," ts=" ">';
                for (var j = 0; j < g.components.length; j++) {
                    var c = g.components[j];
                    if (j > 0)
                        gmlTxt += ' ';
                    gmlTxt += c.x + "," + c.y;
                }
                gmlTxt += '</gml:coordinates>';
                gmlTxt += '</gml:LineString>';
                gmlTxt += '</gml:lineStringProperty>';
            }
            else if (g.CLASS_NAME == "OpenLayers.Geometry.Polygon") {
                gmlTxt += '<gml:polygonProperty>';
                gmlTxt += '<gml:Polygon srsName="' + projCode + '">';
                gmlTxt += '<gml:outerBoundaryIs>';
                gmlTxt += '<gml:LinearRing>';
                gmlTxt += '<gml:coordinates decimal="." cs="," ts=" ">';
                for (var j = 0; j < g.components[0].components.length; j++) {
                    var c = g.components[0].components[j];
                    if (j > 0)
                        gmlTxt += ' ';
                    gmlTxt += c.x + "," + c.y;
                }
                gmlTxt += '</gml:coordinates>';
                gmlTxt += '</gml:LinearRing>';
                gmlTxt += '</gml:outerBoundaryIs>';
                gmlTxt += '</gml:Polygon>';
                gmlTxt += '</gml:polygonProperty>';
            }
            gmlTxt += '</agiv:GV_Feature>';
            gmlTxt += '</gml:featureMember>';
        }
        gmlTxt += '</agiv:FeatureCollection>';
        /**/

        gmlTxt = Ext.util.Format.htmlEncode(gmlTxt);
        Ext.util.downloadFile(exportVectorUrl, gmlTxt);

    }
}

/********************
**  Import Vector  **
********************/

var uploadWin;

function ImportVectorLayer() {

    if (!uploadWin) {
        // define form
        var uploadfield = new Ext.ux.form.FileUploadField({
            id: 'gmlfile',
            name: 'gmlfile',
            width: 300,
            fieldLabel: 'GML bestand',
            emptyText: 'Selecteer een bestand'
        });

        var uploadForm = new Ext.FormPanel({
            labelWidth: 75,
            frame: true,
            fileUpload: true,
            method: 'POST',
            title: 'Importeer GML',
            bodyStyle: 'padding: 5px 5px 0',
            items: [uploadfield],
            buttons: [{
                text: 'Annuleren',
                handler: function () {
                    uploadWin.hide();
                }
            }, {
                text: 'Importeer',
                handler: function () {
                    if (uploadfield.isValid()) {
                        uploadWin.hide();
                        uploadForm.getForm().submit({
                            url: importVectorUrl,
                            waitMsg: 'Inlezen van GML...',
                            success: function (fp, o) {
                                // if the response is recognized as xml, it is converted to lower case (at least in Firefox)
                                // the o.result.msg.gml string is htmlencoded to retain case, and we will now first htmldecode it
                                gmltxt = HtmlDecode(o.result.msg.gml);
                                // parse the string to a DOMObject, convert to an array of features, and assign to the vector layer
                                var gml = new OpenLayers.Format.GML();
                                //var gml = new OpenLayers.Format.GML.v2(gmlOptionsIn);
                                //vecLayer.features = gml.read(gmltxt);
                                vecLayer.addFeatures(gml.read(gmltxt));
                                vecLayer.redraw();
                                msg('Importeer vector laag', vecLayer.features.length + ' features geïmporteerd.');
                            },
                            failure: function (fp, o) {
                                msg('Mislukt', 'Sorry');
                            }
                        });
                    }
                }
            }]
        });

        // define window
        uploadWin = new Ext.Window({
            closeAction: 'hide'
            , layout: 'fit'
            , modal: true
            , width: 450
            , height: 150
            , plain: true
            , border: false
            , items: [uploadForm]
        });
    }

    uploadWin.show();
}
