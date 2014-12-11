//needs variable var CrabUrl2 = 'proxy/regularproxycrab.ashx?url=http://aocsrv34/CRABREST/crab.svc';  SEE Config_constants.js
//and depends on this service

var searchPanel;
if (useSearchPanel)
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
        // define City store
        cityStore = new Ext.data.Store({
            proxy: new Ext.data.HttpProxy({
                url: CrabUrl2 + '/ListCities/',
                method: 'GET'
            }),
            baseParams: { query: "" },
            reader: new Ext.data.JsonReader({
                root: 'ListCitiesResult',
                id: 'GemeenteId'
            }, Ext.data.Record.create([{ name: 'GemeenteId', type: 'int' }, { name: 'GemeenteNaam', type: 'string'}])),
            listeners: {
                load: { fn: function () {
                    citiesCombo.setDisabled(false); // re-enable combobox after load complete
                    Ext.getCmp('search-statusbar').clearStatus({ useDefaults: true });
                }
                }
            }
        });

        cityStore.proxy.addListener('exception', HttpProxyErrorOccurred);
        cityStore.addListener('exception', StoreExceptionOccurred);

        // define Street store
        streetStore = new Ext.data.Store({
            proxy: new Ext.data.HttpProxy({
                //url: CrabUrl2 + '/ListStreets/',
                url: CrabUrl2 + '/ListStraatnamenByGemeenteId/',
                method: 'GET'
            }),
            baseParams: { GemeenteId: "", SorteerVeld: "" },
            reader: new Ext.data.JsonReader({
                //root: 'ListStreetsResult',
                root: 'ListStraatnamenByGemeenteIdResult',
                id: 'StraatnaamId'
            }, Ext.data.Record.create([{ name: 'StraatnaamId', type: 'int' }, { name: 'Straatnaam', type: 'string'}])),
            listeners: {
                load: { fn: function () {
                    streetsCombo.setDisabled(false); // re-enable combobox after load complete
                    Ext.getCmp('search-statusbar').clearStatus({ useDefaults: true });
                }
                }
            }
        });
        streetStore.proxy.addListener('exception', HttpProxyErrorOccurred);
        streetStore.addListener('exception', StoreExceptionOccurred);

        // define Housenumber store
        houseNumberStore = new Ext.data.Store({
            proxy: new Ext.data.HttpProxy({
                url: CrabUrl2 + '/ListHuisnummersByStraatnaamId/',
                method: 'GET'
            }),
            baseParams: { StraatnaamId: "", SorteerVeld: "" },
            reader: new Ext.data.JsonReader({
                root: 'ListHuisnummersByStraatnaamIdResult',
                id: 'HuisnummerId'
            }, Ext.data.Record.create([{ name: 'HuisnummerId', type: 'int' }, { name: 'Huisnummer', type: 'string'}])),
            listeners: {
                load: { fn: function () {
                    houseNumbersCombo.setDisabled(false); // re-enable combobox after load complete
                    Ext.getCmp('search-statusbar').clearStatus({ useDefaults: true });
                }
                }
            }
        });
        houseNumberStore.proxy.addListener('exception', HttpProxyErrorOccurred);
        houseNumberStore.addListener('exception', StoreExceptionOccurred);

        /*********************
        **    COMBOBOXES    **
        *********************/
        citiesCombo = new Ext.form.ComboBox({
            store: cityStore,
            disabled: true,
            displayField: 'GemeenteNaam',
            valueField: 'GemeenteId',
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
                        streetsCombo.setDisabled(true);
                        streetsCombo.setValue('');
                        houseNumbersCombo.setDisabled(true);
                        houseNumbersCombo.setValue('');
                        Ext.getCmp('search-statusbar').showBusy({ text: 'Even geduld: inladen van straten...' });
                        //streetsCombo.store.reload({ params: { 'CityID': combo.getValue()} });
                        streetsCombo.store.reload({ params: { 'GemeenteId': combo.getValue(), 'SorteerVeld': 2} });
                        CurrentCity = combo.getValue();
                        if (Ext.getCmp('crab_imm_chkbx').checked)
                            zoomLocation(citiesCombo.getValue(), streetsCombo.getValue(), houseNumbersCombo.getValue());
                    }
                }
            }
        });

        citiesCombo.on('change', function (a, newv, oldv) {
            if (citiesCombo.value != CurrentCity && citiesCombo.selectedIndex != (-1)) {
                streetsCombo.setDisabled(true);
                streetsCombo.setValue('');
                houseNumbersCombo.setDisabled(true);
                houseNumbersCombo.setValue('');

                Ext.getCmp('search-statusbar').showBusy({ text: 'Even geduld: inladen van straten...' });
                //streetsCombo.store.reload({ params: { 'CityID': combo.getValue()} });
                streetsCombo.store.reload({ params: { 'GemeenteId': newv, 'SorteerVeld': 1} });
                CurrentCity = newv;
            }
            if (citiesCombo.selectedIndex == (-1)) {
                streetsCombo.setDisabled(true);
                streetsCombo.setValue('');
                houseNumbersCombo.setDisabled(true);
                houseNumbersCombo.setValue('');
            }
        }, this);


        streetsCombo = new Ext.form.ComboBox({
            store: streetStore,
            disabled: true,
            displayField: 'Straatnaam',
            valueField: 'StraatnaamId',
            typeAhead: true,
            mode: 'local',
            allowBlank: true,
            triggerAction: 'all',
            emptyText: 'Selecteer een straat ...',
            selectOnFocus: true,
            hideLabel: true,
            anchor: '100%',
            listeners: {
                select: {
                    fn: function (combo, value) {
                        // disable other comboboxes
                        houseNumbersCombo.setDisabled(true);
                        houseNumbersCombo.setValue('');
                        Ext.getCmp('search-statusbar').showBusy({ text: 'Even geduld: inladen van huisnummers...' });
                        houseNumbersCombo.store.reload({ params: { 'StraatnaamId': combo.getValue(), 'SorteerVeld': 2} });
                        CurrentStreet = combo.getValue();
                        if (Ext.getCmp('crab_imm_chkbx').checked)
                            zoomLocation(citiesCombo.getValue(), streetsCombo.getValue(), houseNumbersCombo.getValue());
                    }
                }
            }
        });
        streetsCombo.on('change', function (a, newv, oldv) {
            if (streetsCombo.value != CurrentStreet && streetsCombo.selectedIndex != (-1)) {
                houseNumbersCombo.setDisabled(true);
                houseNumbersCombo.setValue('');
                Ext.getCmp('search-statusbar').showBusy({ text: 'Even geduld: inladen van huisnummers...' });
                houseNumbersCombo.store.reload({ params: { 'StraatnaamId': newv, 'SorteerVeld': 2} });
                CurrentStreet = newv;
            }
            if (streetsCombo.selectedIndex == (-1)) {
                houseNumbersCombo.setDisabled(true);
                houseNumbersCombo.setValue('');
            }
        }, this);
        houseNumbersCombo = new Ext.form.ComboBox({
            store: houseNumberStore,
            disabled: true,
            typeAhead: true,
            displayField: 'Huisnummer',
            valueField: 'HuisnummerId',
            mode: 'local',
            triggerAction: 'all',
            emptyText: 'Selecteer een huisnummer ...',
            hideLabel: true,
            anchor: '100%',
            listeners: {
                select: {
                    fn: function (combo, value) {

                        if (Ext.getCmp('crab_imm_chkbx').checked)
                            zoomLocation(citiesCombo.getValue(), streetsCombo.getValue(), houseNumbersCombo.getValue());
                    }
                }
            }
        });



        /******************
        **    BUTTONS    **
        ******************/

        zoomLocationButton = new Ext.Button({
            //text: 'Zoom naar lokatie',
            tooltip: "Zoom naar lokatie",
            iconCls: "btnZoomIn",
            handler: function () {
                zoomLocation(citiesCombo.getValue(), streetsCombo.getValue(), houseNumbersCombo.getValue());
            }
        });

        viewLocationButton = new Ext.Button({
            //text: 'Toon straat als vector',
            tooltip: 'Toon straat als vector',
            iconCls: "btnLine",
            handler: function () {
                showLocation(citiesCombo.getValue(), streetsCombo.getValue(), houseNumbersCombo.getValue());
            }
        });
        immediatecheckbox = {
            xtype: 'checkbox',
            id: 'crab_imm_chkbx',
            fieldLabel: "",
            boxLabel: 'Onmiddellijk zoomen',
            inputValue: 'a'
        };

        removeLocationButton = new Ext.Button({
            //text: 'Verwijder straat/huisnr/perceel',
            tooltip: 'Verwijder straat/huisnr/perceel',
            iconCls: "btnCross",
            handler: function () {

                removeLocation();
            }
        });

        /*******************
        **      FORM      **
        *******************/


        // define search form
        searchPanel = new Ext.FormPanel({
            title: 'Zoek op adres'
        , id: 'searchpanelCrab'
        , layout: 'form'
        , anchor: '100%'
        , height: 200
        , width: 200
        , bodyStyle: 'padding:5px'
        , border: false
        , collapsible: true
        , collapsed: true
        , items: [citiesCombo,
                    streetsCombo,
                    houseNumbersCombo,
                    {
                        // have buttons shown next to each other
                        layout: 'column'
                        , border: false
                        , items: [zoomLocationButton, viewLocationButton, removeLocationButton]
                    },
                    immediatecheckbox
                 ]
        , tbar: new Ext.ux.StatusBar({
            id: 'search-statusbar',
            defaultText: 'Klaar',
            defaultIconCls: ''
        })
        });
        if (issimple) {
            searchPanel.collapsible = false;
            searchPanel.collapsed = false;
        }
        // immediately start loading cities
        if (useSearchPanel) {
            Ext.getCmp('search-statusbar').showBusy({ text: 'Even geduld: inladen van gemeenten...' });
            cityStore.load();
        }

        /*************************
        ** BUTTON FUNCTIONALITY **
        *************************/
        // zoom to specified location
        function zoomLocation(CityID, StreetID, HousenumberID) {

            if (CityID == null || CityID == '' || citiesCombo.selectedIndex == (-1)) {
                msg('Zoom naar lokatie', 'Selecteer eerst een gemeente');
                return;
            }
            if (StreetID == null || StreetID == '' || streetsCombo.selectedIndex == (-1)) {
                //            msg('Zoom naar lokatie', 'Selecteer eerst een straat');
                //            return;
                StreetID = 0;
            }
            if (HousenumberID == null || HousenumberID == '' || houseNumbersCombo.selectedIndex == (-1)) {
                HousenumberID = 0;
            }
            searchPanel.getForm().submit({
                //url: CrabUrl2 + '/GetLocation/' + CityID + '/' + StreetID + '/' + HousenumberID,
                url: CrabUrl2 + '/GetLocation/?GemeenteId=' + CityID + '&StraatId=' + StreetID + '&HousenumberID=' + HousenumberID,
                method: 'GET',
                waitMsg: 'Opzoeken locatie...',
                failure: function (searchpanel, o) {
                    // CrabService doesn't return a "success" parameter, so we always end up in the "failure" scenario
                    if (o.result) {
                        if (o.result.Bounds == "0,0,0,0") {
                            msg('Zoom naar lokatie', 'Geen locatie gevonden');
                        }
                        else {
                            if (HousenumberID != 0) {
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

        // show the selected location on the map with a coloured polygon
        function showLocation(CityID, StreetID, HousenumberID) {
            if (StreetID == null || StreetID == '' || streetsCombo.selectedIndex == (-1)) {
                msg('Toon straat', 'Selecteer eerst een straat');
                return;
            }
            searchPanel.getForm().submit({
                //url: CrabUrl + '/GetFeatureShape/' + StreetID,
                url: CrabUrl2 + '/GetFeatureShape?StreetID=' + StreetID,
                method: 'GET',
                waitMsg: 'Opzoeken straat...',
                failure: function (searchpanel, o) {
                    // CrabService doesn't return a "success" parameter, so we always end up in the "failure" scenario
                    if (o.result) {
                        // give streets a different vector style
                        var layer_style = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
                        var style_streets = OpenLayers.Util.extend({}, layer_style);
                        style_streets.strokeColor = '#00FF00';
                        style_streets.strokeWidth = 3;
                        // add all features
                        for (i = 0; i < o.result.length; i++) {
                            g = new OpenLayers.Format.GML();
                            g.geometryName = 'SHAPE';
                            features = g.read(o.result[i]);
                            for (j = 0; j < features.length; j++) {
                                features[j].style = style_streets;
                            }
                            vecLayer.addFeatures(features, null);
                        }
                    }
                    else {
                        msg('Toon straat', 'Er liep iets fout. Sorry.');
                    }
                }
            });
        }
    });