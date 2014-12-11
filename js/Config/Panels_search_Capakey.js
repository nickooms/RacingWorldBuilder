//needs variable var CapakeyUrl = 'proxy/regularproxycrab.ashx?url=http://aocsrv34/CAPAKEYREST/capakey.svc';  SEE Config_constants.js
var capasearchPanel;

if(useCapasearchPanel)
Ext.onReady(function () {

    // error handlers
    function HttpProxyErrorOccurred(proxy, type, action, options, response, arg) {
        alert('Http proxy error:\n\ntype: ' + type + '\nresponseXML: ' + response.responseXML + '\nstatusText: ' + response.statusText + '\nArg: ' + arg);
    }

    function StoreExceptionOccurred(misc) {
        alert('Store exception occurred');
    }
    /************************
    **  STORE DEFINITIONS  **
    ************************/
    // define capaCity store
    capacityStore = new Ext.data.Store({
        proxy: new Ext.data.HttpProxy({
            url: CapakeyUrl + '/ListAdmGemeenten/',
            method: 'GET'
        }),
        baseParams: { SorteerVeld: "2" },
        reader: new Ext.data.JsonReader({
            root: 'ListAdmGemeentenResult',
            id: 'Niscode'
        }, Ext.data.Record.create([{ name: 'Niscode', type: 'string' }, { name: 'AdmGemeentenaam', type: 'string'}])),
        listeners: {
            load: { fn: function () {
                capacitiesCombo.setDisabled(false); // re-enable combobox after load complete
                Ext.getCmp('capasearch-statusbar').clearStatus({ useDefaults: true });
            }
            }
        }
    });

    capacityStore.proxy.addListener('exception', HttpProxyErrorOccurred);
    capacityStore.addListener('exception', StoreExceptionOccurred);

    // define capaafdelingStore store
    capaafdelingStore = new Ext.data.Store({
        proxy: new Ext.data.HttpProxy({
            //url: CrabUrl2 + '/ListStreets/',
            url: CapakeyUrl + '/ListKadAfdelingenByNiscode/',
            method: 'GET'
        }),
        baseParams: { Niscode: "", SorteerVeld: "" },
        reader: new Ext.data.JsonReader({
            //root: 'ListStreetsResult',
            root: 'ListKadAfdelingenByNiscodeResult',
            id: 'KadAfdelingcode'
        }, Ext.data.Record.create([{ name: 'KadAfdelingcode', type: 'string' }, { name: 'KadAfdelingnaam', type: 'string'}])),
        listeners: {
            load: { fn: function () {
                capaafdelingenCombo.setDisabled(false); // re-enable combobox after load complete
                Ext.getCmp('capasearch-statusbar').clearStatus({ useDefaults: true });
            }
            }
        }
    });
    capaafdelingStore.proxy.addListener('exception', HttpProxyErrorOccurred);
    capaafdelingStore.addListener('exception', StoreExceptionOccurred);

    // define capasectieStore store
    capasectieStore = new Ext.data.Store({
        proxy: new Ext.data.HttpProxy({
            //url: CrabUrl2 + '/ListStreets/',
            url: CapakeyUrl + '/ListKadSectiesByKadAfdelingcode/',
            method: 'GET'
        }),
        baseParams: { KadAfdelingcode: "" },
        reader: new Ext.data.JsonReader({
            //root: 'ListStreetsResult',
            root: 'ListKadSectiesByKadAfdelingcodeResult',
            id: 'KadSectiecode'
        }, Ext.data.Record.create([{ name: 'KadSectiecode', type: 'string'}])),
        listeners: {
            load: { fn: function () {
                capasectiesCombo.setDisabled(false); // re-enable combobox after load complete
                Ext.getCmp('capasearch-statusbar').clearStatus({ useDefaults: true });
            }
            }
        }
    });
    capasectieStore.proxy.addListener('exception', HttpProxyErrorOccurred);
    capasectieStore.addListener('exception', StoreExceptionOccurred);

    // define capaperceelStore store
    capaperceelStore = new Ext.data.Store({
        proxy: new Ext.data.HttpProxy({
            //url: CrabUrl2 + '/ListStreets/',
            url: CapakeyUrl + '/ListKadPerceelsnummersByKadSectiecode/',
            method: 'GET'
        }),
        baseParams: { KadAfdelingcode: "", KadSectieCode: "", SorteerVeld: "" },
        reader: new Ext.data.JsonReader({
            //root: 'ListStreetsResult',
            root: 'ListKadPerceelsnummersByKadSectiecodeResult',
            id: 'CaPaKey'
        }, Ext.data.Record.create([{ name: 'CaPaKey', type: 'string' }, { name: 'KadPerceelsnummer', type: 'string'}])),
        listeners: {
            load: { fn: function () {
                capapercelenCombo.setDisabled(false); // re-enable combobox after load complete
                Ext.getCmp('capasearch-statusbar').clearStatus({ useDefaults: true });
            }
            }
        }
    });
    capaperceelStore.proxy.addListener('exception', HttpProxyErrorOccurred);
    capaperceelStore.addListener('exception', StoreExceptionOccurred);

    /*********************
    **    COMBOBOXES    **
    *********************/
    capacitiesCombo = new Ext.form.ComboBox({
        store: capacityStore,
        disabled: true,
        displayField: 'AdmGemeentenaam',
        valueField: 'Niscode',
        typeAhead: true,
        mode: 'local',
        allowBlank: false,
        triggerAction: 'all',
        emptyText: 'Selecteer een gemeente ...',
        selectOnFocus: true,
        hideLabel: true,
        anchor: '100%',
        listeners: {
            select: {
                fn: function (combo, value) {
                    // disable other comboboxes
                    capaafdelingenCombo.setDisabled(true);
                    capaafdelingenCombo.setValue('');
                    capasectiesCombo.setDisabled(true);
                    capasectiesCombo.setValue('');
                    capapercelenCombo.setDisabled(true);
                    capapercelenCombo.setValue('');
                    Ext.getCmp('capasearch-statusbar').showBusy({ text: 'Even geduld: inladen van afdelingen...' });
                    capaafdelingenCombo.store.reload({ params: { 'Niscode': combo.getValue(), 'SorteerVeld': 2} });
                    CurrentCityK = combo.getValue();
                    if (Ext.getCmp('capa_imm_chkbx').checked)
                        capazoomLocation(capacitiesCombo.getValue(), capaafdelingenCombo.getValue(), capasectiesCombo.getValue(), capapercelenCombo.getValue());
                }
            }
        }
    });
    capacitiesCombo.on('change', function (a, newv, oldv) {
        if (capacitiesCombo.value != CurrentCityK && capacitiesCombo.selectedIndex != (-1)) {
            capaafdelingenCombo.setDisabled(true);
            capaafdelingenCombo.setValue('');
            capasectiesCombo.setDisabled(true);
            capasectiesCombo.setValue('');
            capapercelenCombo.setDisabled(true);
            capapercelenCombo.setValue('');
            Ext.getCmp('capasearch-statusbar').showBusy({ text: 'Even geduld: inladen van afdelingen...' });
            capaafdelingenCombo.store.reload({ params: { 'Niscode': newv, 'SorteerVeld': 2} });
            CurrentCityK = newv;
        }
        if (capacitiesCombo.selectedIndex == (-1)) {
            capaafdelingenCombo.setDisabled(true);
            capaafdelingenCombo.setValue('');
            capasectiesCombo.setDisabled(true);
            capasectiesCombo.setValue('');
            capapercelenCombo.setDisabled(true);
            capapercelenCombo.setValue('');
        }
    }, this);

    capaafdelingenCombo = new Ext.form.ComboBox({
        store: capaafdelingStore,
        disabled: true,
        displayField: 'KadAfdelingnaam',
        valueField: 'KadAfdelingcode',
        typeAhead: true,
        mode: 'local',
        allowBlank: true,
        triggerAction: 'all',
        emptyText: 'Selecteer een afdeling ...',
        selectOnFocus: true,
        hideLabel: true,
        anchor: '100%',
        listeners: {
            select: {
                fn: function (combo, value) {
                    // disable other comboboxes
                    capasectiesCombo.setDisabled(true);
                    capasectiesCombo.setValue('');
                    capapercelenCombo.setDisabled(true);
                    capapercelenCombo.setValue('');
                    Ext.getCmp('capasearch-statusbar').showBusy({ text: 'Even geduld: inladen van secties...' });
                    capasectiesCombo.store.reload({ params: { 'KadAfdelingcode': combo.getValue()} });
                    CurrentAfdeling = combo.getValue();
                    if (Ext.getCmp('capa_imm_chkbx').checked)
                        capazoomLocation(capacitiesCombo.getValue(), capaafdelingenCombo.getValue(), capasectiesCombo.getValue(), capapercelenCombo.getValue());
                }
            }
        }
    });
    capaafdelingenCombo.on('change', function (a, newv, oldv) {
        if (capaafdelingenCombo.value != CurrentAfdeling && capaafdelingenCombo.selectedIndex != (-1)) {
            capasectiesCombo.setDisabled(true);
            capasectiesCombo.setValue('');
            capapercelenCombo.setDisabled(true);
            capapercelenCombo.setValue('');
            Ext.getCmp('capasearch-statusbar').showBusy({ text: 'Even geduld: inladen van secties...' });
            capasectiesCombo.store.reload({ params: { 'KadAfdelingcode': newv} });
            CurrentAfdeling = newv;
        }
        if (capaafdelingenCombo.selectedIndex == (-1)) {
            capasectiesCombo.setDisabled(true);
            capasectiesCombo.setValue('');
            capapercelenCombo.setDisabled(true);
            capapercelenCombo.setValue('');
        }
    }, this);

    capasectiesCombo = new Ext.form.ComboBox({
        store: capasectieStore,
        disabled: true,
        displayField: 'KadSectiecode',
        valueField: 'KadSectiecode',
        typeAhead: true,
        mode: 'local',
        allowBlank: true,
        triggerAction: 'all',
        emptyText: 'Selecteer een sectie ...',
        selectOnFocus: true,
        hideLabel: true,
        anchor: '100%',
        listeners: {
            select: {
                fn: function (combo, value) {
                    // disable other comboboxes
                    capapercelenCombo.setDisabled(true);
                    capapercelenCombo.setValue('');
                    Ext.getCmp('capasearch-statusbar').showBusy({ text: 'Even geduld: inladen van percelen...' });
                    capapercelenCombo.store.reload({ params: { 'KadAfdelingcode': capaafdelingenCombo.getValue(), 'KadSectieCode': combo.getValue(), 'SorteerVeld': 1} });
                    CurrentSectie = combo.getValue();
                    if (Ext.getCmp('capa_imm_chkbx').checked)
                        capazoomLocation(capacitiesCombo.getValue(), capaafdelingenCombo.getValue(), capasectiesCombo.getValue(), capapercelenCombo.getValue());
                }
            }
        }
    });
    capasectiesCombo.on('change', function (a, newv, oldv) {
        if (capasectiesCombo.value != CurrentSectie && capasectiesCombo.selectedIndex != (-1)) {
            capapercelenCombo.setDisabled(true);
            capapercelenCombo.setValue('');
            Ext.getCmp('capasearch-statusbar').showBusy({ text: 'Even geduld: inladen van percelen...' });
            capapercelenCombo.store.reload({ params: { 'KadAfdelingcode': capaafdelingenCombo.getValue(), 'KadSectieCode': newv, 'SorteerVeld': 1} });
            CurrentSectie = newv;
        }
        if (capasectiesCombo.selectedIndex == (-1)) {
            capapercelenCombo.setDisabled(true);
            capapercelenCombo.setValue('');
        }
    }, this);

    capapercelenCombo = new Ext.form.ComboBox({
        store: capaperceelStore,
        disabled: true,
        typeAhead: true,
        displayField: 'KadPerceelsnummer',
        valueField: 'KadPerceelsnummer',
        mode: 'local',
        triggerAction: 'all',
        emptyText: 'Selecteer een perceel ...',
        hideLabel: true,
        anchor: '100%',
        listeners: {
            select: {
                fn: function (combo, value) {
                    if (Ext.getCmp('capa_imm_chkbx').checked)
                        capazoomLocation(capacitiesCombo.getValue(), capaafdelingenCombo.getValue(), capasectiesCombo.getValue(), capapercelenCombo.getValue());
                }
            }
        }
    });


    /******************
    **    BUTTONS    **
    ******************/
    capazoomLocationButton = new Ext.Button({
        //text: 'Zoom naar lokatie',
        tooltip: "Zoom naar lokatie",
        iconCls: "btnZoomIn",
        handler: function () {
            capazoomLocation(capacitiesCombo.getValue(), capaafdelingenCombo.getValue(), capasectiesCombo.getValue(), capapercelenCombo.getValue());
        }
    });
    removeLocationButton = new Ext.Button({
        //text: 'Verwijder straat/huisnr/perceel',
        tooltip: 'Verwijder straat/huisnr/perceel',
        iconCls: "btnCross",
        handler: function () {

            removeLocation();
        }
    });

    immediatecheckbox = {
        xtype: 'checkbox',
        id: 'capa_imm_chkbx',
        fieldLabel: "",
        boxLabel: 'Onmiddellijk zoomen',
        inputValue: 'a'
         
    };

    /*******************
    **      FORM      **
    *******************/

    // define search form
    capasearchPanel = new Ext.FormPanel({
        title: 'Zoek op perceel'
        , id: 'lPc'
        , layout: 'form'
        , anchor: '100%'
        , height: 200
        , width: 200
        , bodyStyle: 'padding:5px'
        , border: false
        , collapsible: true
        , collapsed: true
        , items: [capacitiesCombo,
                    capaafdelingenCombo,
                    capasectiesCombo,
                    capapercelenCombo,
                    {
                        // have buttons shown next to each other
                        layout: 'column'
                        , border: false
                        , items: [capazoomLocationButton, removeLocationButton]
                    },
                    immediatecheckbox
                 ]
        , tbar: new Ext.ux.StatusBar({
            id: 'capasearch-statusbar',
            defaultText: 'Klaar',
            defaultIconCls: ''
        })
    });
    if (issimple) {
        capasearchPanel.collapsible = false;
        capasearchPanel.collapsed = false;
    }
    // immediately start loading cities
    if (useCapasearchPanel) {
        Ext.getCmp('capasearch-statusbar').showBusy({ text: 'Even geduld: inladen van kadastergemeenten...' });
        capacityStore.load();
    }

    /*************************
    ** BUTTON FUNCTIONALITY **
    *************************/
    function capazoomLocation(gemeenteId, afdelingId, sectieId, perceelId) {
        if (gemeenteId == null || gemeenteId == '' || capacitiesCombo.selectedIndex == (-1)) {
            msg('Zoom naar lokatie', 'Selecteer eerst een gemeente');
            return;
        }
        if (afdelingId == null || afdelingId == '' || capaafdelingenCombo.selectedIndex == (-1)) {
            //            msg('Zoom naar lokatie', 'Selecteer eerst een straat');
            //            return;
            afdelingId = 0;
        }
        if (sectieId == null || sectieId == '' || capasectiesCombo.selectedIndex == (-1)) {
            sectieId = 0;
        }
        if (perceelId == null || perceelId == '' || capapercelenCombo.selectedIndex == (-1)) {
            perceelId = 0;
        }
        capasearchPanel.getForm().submit({
            //url: CrabUrl2 + '/GetLocation/' + CityID + '/' + StreetID + '/' + HousenumberID,
            url: CapakeyUrl + '/GetLocation/?gemeenteId=' + gemeenteId + '&afdelingId=' + afdelingId + '&sectieId=' + sectieId + '&perceelId=' + perceelId,
            method: 'GET',
            waitMsg: 'Opzoeken locatie...',
            failure: function (capasearchpanel, o) {
                // CapakeyService doesn't return a "success" parameter, so we always end up in the "failure" scenario
                if (o.result) {
                    if (o.result.Bounds == "0,0,0,0") {
                        msg('Zoom naar lokatie', 'Geen locatie gevonden');                    }
                    else {
                        if (perceelId != 0) {
                            if (useProjection == "Lambert") {
                                var feature = new OpenLayers.Feature.Vector(
                                new OpenLayers.Geometry.Point(o.result.LambertX, o.result.LambertY),
                                { some: 'data' },
                                { externalGraphic: 'img/pin.png', graphicHeight: 21, graphicWidth: 16 });
                                vecLayer.addFeatures(feature);
                            }
                            if (useProjection == "WGS84") {
                                var resultaat = dolambert(o.result.LambertX, o.result.LambertY);
                                var feature = new OpenLayers.Feature.Vector(
                                new OpenLayers.Geometry.Point(resultaat[1], resultaat[0]),
                                { some: 'data' },
                                { externalGraphic: 'img/pin.png', graphicHeight: 21, graphicWidth: 16 });
                                vecLayer.addFeatures(feature);
                            }
                        }
                        if (useProjection == "Lambert") {
                            var zoom = mapPanel.map.layers[0].getZoomForExtent(new OpenLayers.Bounds.fromString(o.result.Bounds));
                            mapPanel.map.setCenter(new OpenLayers.LonLat(o.result.LambertX, o.result.LambertY), zoom);
                        }
                        if (useProjection == "WGS84") {
                            var zoom = mapPanel.map.layers[0].getZoomForExtent(new OpenLayers.Bounds.fromString(dolambertbounds(o.result.Bounds)));
                            var lonlat = new OpenLayers.Bounds.fromString(dolambertbounds(o.result.Bounds)).getCenterLonLat()
                            mapPanel.map.setCenter(new OpenLayers.LonLat(lonlat.lon, lonlat.lat), zoom);
                        }
                    }
                }
                else {
                    msg('Zoom naar lokatie', 'Er liep iets fout');
                }
            }
        });
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