var p;
Ext.onReady(function () {
    var opacityLayer;
    var addLayerButton = new Ext.Button({
        text: "Voeg laag toe",
        tooltip: "Voeg laag toe",
        iconCls: "btnAddLayers",
        handler: showCapabilitiesGrid
    });
    removeLayerAction = new Ext.Action({
        text: "Verwijder laag",
        tooltip: "Verwijder laag",
        iconCls: "btnDelLayer",
        disabled: true,
        handler: function () {
            delLayer();
        }
    });
    /****************
    ***  Buttons  ***
    *****************/
    layerToolbar = [];
    if (!issimple) {

        layerToolbar.push(addLayerButton);
    }


    if (!issimple) {

        layerToolbar.push(removeLayerAction);
    }


    /***********************
    ***   Tree: Lagen    ***
    ***********************/

    // - root node
    var layerRoot = new Ext.tree.TreeNode({
        text: "Alle lagen"
        , expanded: true
        , loader: new GeoExt.tree.LayerLoader({
            applyLoader: true
        })
    });

    // - WMS layers node (except for base layers)
    var wmscontainer = new GeoExt.tree.LayerContainer({
        text: "WMS lagen"
        , id: 'wmslayers'
        , layerStore: mapPanel.layers
        , expanded: true
        , loader: {
            filter: function (record) {
                return record.get("layer").CLASS_NAME.indexOf("WMS") > -1 && !record.get("layer").isBaseLayer;
            }
        }
        , leaf: false
    });

    if (issimple) {
        wmscontainer.text = "GRB";
        wmscontainer.id = "xxx";
    }

    wmscontainer.addListener('append', updateWMSLayerList);
    layerRoot.appendChild(wmscontainer);


    // - base layers node
    layerRoot.appendChild(new GeoExt.tree.BaseLayerContainer({
        text: "Basislagen"
        , id: 'baselayers'
        , map: mapPanel.map
        , expanded: true
        , leaf: false
    }));



    if (!issimple) {

        // - vector layer node
        layerRoot.appendChild(new GeoExt.tree.OverlayLayerContainer({
            text: "Tekenlaag"
        , id: 'vectorlayers'
        , map: mapPanel.map
        , expanded: true
        , loader: {
            filter: function (record) {
                return record.get("layer").name == 'Vector';
            }
        }
        , leaf: false
        }));
    }

    // Build the tree
    layerPanel = new Ext.tree.TreePanel({
        title: "Lagen"
        , root: layerRoot
        , border: false
        , collapsible: true
        , expanded: true
        , animate: true
        , enableDD: true
        , tbar: layerToolbar
        , autoScroll: true
        , rootVisible: false
        , height: 350
        , selModel: new Ext.tree.DefaultSelectionModel({
            listeners: {
                beforeselect: function (sel, node) {
                    if (node.layer == undefined) return false;
                    if (node.layer.isBaseLayer || node.layer.name == 'Vector') return false;
                    if (node.layer && node.layer.url ) {
                        if (node.layer.params.USR != "" && node.layer.params.USR != undefined) {
                            SetLayerActive(node.layer, node.layer.params.USR, node.layer.params.PWD);
                        }
                        else {
                            SetLayerActive(node.layer, "", "");
                            opacityLayer = node.layer;
                            if (opacityLayer.opacity == null)
                                layerPanel.contextMenu.items.items[1].setValue(100);
                            else
                                layerPanel.contextMenu.items.items[1].setValue(opacityLayer.opacity * 100);
                        }
                    }
                    if (node && node.layer ) {
                        // enable removal button
                        removeLayerAction.enable();
                    }
                    else {
                        // disable removal of baselayers & the default vector layer
                        //node.layer.setVisibility(true);
                        removeLayerAction.disable();
                        SetLayerActive("", "", "");
                    }
                },
                scope: this

            }
        })
        , listeners: {
            contextmenu: function (node, e) {
                // show context menu on non-base layers
                if (node && node.layer && (node.layer.isBaseLayer == false) && node.layer.name != 'Vector') {
                    node.select();
                    var c = node.getOwnerTree().contextMenu;
                    c.contextNode = node;
                    c.showAt(e.getXY());
                }
                if (node.id == "wmslayers") {
                    var c = new Ext.menu.Menu({
                        items: [{ text: "Voeg laag toe",
                            iconCls: "btnAddLayer",
                            handler: function () {
                                showCapabilitiesGrid();

                            },
                            scope: this
                        },
                        { text: "Verwijder Lagen",
                            iconCls: "btnDelLayer",
                            handler: function () {
                                delLayers();
                            },
                            scope: this
                        },
                        { text: "Alle lagen aan",
                            //   iconCls: "btnDelLayer",
                            handler: function () {
                                allLayersVisible(true);
                            },
                            scope: this
                        },
                        { text: "Alle lagen uit",
                            //   iconCls: "btnDelLayer",
                            handler: function () {
                                allLayersVisible(false);
                            },
                            scope: this
                        }
                        ]
                    });
                    c.showAt(e.getXY());
                }
            },
            // TODO: remove this when http://www.geoext.org/trac/geoext/ticket/112 is closed
            startdrag: function (tree, node, evt) {
                //node.getUI().checkbox.checked = node.attributes.checked;
            },

            nodeDrop: function (evt) {
                map.setLayerIndex(map.getLayersByName('Vector')[0], map.getNumLayers() - 1);
            },
            nodedragover: function (evt) {
                if (evt.target.parentNode.id == "wmslayers")
                    return true;
                else
                    return false;

            },
            scope: this
        },
        // define context menu for right-click on layer
        contextMenu: new Ext.menu.Menu({
            items: [
                               {
                                   text: "Zichtbaarheid instellen",
                                   scope: this
                               },
                                            {
                                                handler: function () {
                                                    var node = layerPanel.getSelectionModel().getSelectedNode();
                                                    if (node && node.layer) {
                                                        slider.layer = node.layer;
                                                    }
                                                },
                                                xtype: "gx_opacityslider",
                                                fieldLabel: 'test',
                                                layer: opacityLayer,
                                                changevisibility: false,
                                                aggressive: true,
                                                vertical: false,
                                                width: 140,
                                                value: 100,
                                                plugins: new GeoExt.LayerOpacitySliderTip({ template: "Opaciteit: {opacity}%" }),
                                                scope: this
                                            },
                    {
                        text: "Zoom naar laag",
                        iconCls: "zoomfull",
                        handler: function () {
                            var node = layerPanel.getSelectionModel().getSelectedNode();
                            if (node && node.layer) {
                                mapPanel.map.zoomToExtent(node.layer.maxExtent);
                            }
                        },
                        scope: this
                    }
                   , removeLayerAction
                   , {
                       text: "Voeg laag toe",
                       iconCls: "btnAddLayer",
                       handler: function () {
                           showCapabilitiesGrid();
                       },
                       scope: this
                   }
                ]
        })
    });
    layerPanel.addListener('insert', updateWMSLayerList);
    if (issimple) {
        layerPanel.contextMenu.items.items[3].doHide();
        layerPanel.contextMenu.items.items[4].doHide();
    }
    /*************************
    ***  WMS Capabilities  ***
    *************************/

    var wmsGrid, sourcesGrid, wmsWin;
    var pwdDict = new Dictionary(); // used to store login/password for WMS sites

    // store with sources (from local XML)
    var wmsSourcesStore = new Ext.data.Store({
        proxy: new Ext.data.HttpProxy({
            url: wmsSourcesUrl,
            method: 'GET'
        })
        , reader: new Ext.data.XmlReader({
            record: 'service'
                , id: 'serviceReader'
        }, ['name', 'url', 'description'])
        , listeners: {
            load: {
                fn: function () {
                    Ext.getCmp('statusbar-sources').clearStatus({ useDefaults: true });
                    sourcesGrid.getBottomToolbar().setDisabled(false);
                }
            }
        }
    });

    // store with wms capabilities (loaded by clicking on source)
    var wmsCapStore = new GeoExt.data.WMSCapabilitiesStore({
        reader: new GeoExt.data.WMSCapabilitiesReader()
        , url: proxyUrl
        , listeners: {
            load: {
                // when store is loaded, clear status bar
                fn: function (proxy, o, options) {
                    Ext.getCmp('statusbar-wms').clearStatus({ useDefaults: true });

                }
            }
            , exception: {
                fn: function (proxy, type, action, options, response, arg) {
                    if (response.status == '401') {
                        Ext.getCmp('statusbar-wms').setStatus({ text: 'Login vereist', iconCls: 'x-status-error' });
                        // ask for login & password
                        ShowLoginForm(options.params.url);
                    }
                    else {

                        Ext.getCmp('statusbar-wms').setStatus({ text: 'Inladen is mislukt', iconCls: 'x-status-error' });
                        msg('Fout bij inladen', arg);
                    }
                }
            }
        }
    });

    // login window
    var loginWin;
    function ShowLoginForm(url) {


        // define form
        var loginForm = new Ext.FormPanel({
            labelWidth: 75,
            frame: true,
            title: 'Login vereist',
            bodyStyle: 'padding: 5px 5px 0',
            defaultType: 'textfield',
            items: [{
                fieldLabel: 'Login',
                name: 'login',
                width: 200,
                value: initUser
            }, {
                fieldLabel: 'Password',
                name: 'password',
                width: 200,
                value: initKey
            }],
            buttons: [{
                text: 'Annuleren',
                handler: function () {
                    loginWin.hide();
                    Ext.getCmp('statusbar-wms').setStatus({ text: 'Inladen is mislukt', iconCls: 'x-status-error' });

                }
            }, {
                text: 'Login',
                handler: function () {
                    initUser = loginForm.getForm().findField('login').getValue();
                    initKey = loginForm.getForm().findField('password').getValue();
                    LoadWithLogin(null, url, initUser, initKey);
                    loginWin.close();
                }
            }]
        });

        // define window
        loginWin = new Ext.Window({
            closeAction: 'hide'
            , layout: 'fit'
            , modal: true
            , width: 320
            , height: 150
            , plain: false
            , border: false
            , items: [loginForm]
        });

        loginWin.show();
    }

    // call LoadCapabilities with login info
    function LoadWithLogin(title, url, login, password) {
        // save login/password for future use
        if (pwdDict.Lookup(url)) {
            pwdDict.Delete(url);
        }

        var p = new Object();
        p.login = login;
        p.password = password;
        pwdDict.Add(url, p);
        // url = OpenLayers.Proxyhost + url;
        // load capabilities with login & password
        LoadCapabilities(title, { url: url, request: 'GetCapabilities', usr: login, pwd: password });
    }

    // call LoadCapabilities without login info
    function LoadWithoutLogin(title, url) {
        LoadCapabilities(title, { url: url, request: 'GetCapabilities' });
    }

    // load wmsCapStore for the given url
    function LoadCapabilities(title, params) {
        wmsCapStore.removeAll();
        Ext.getCmp('statusbar-wms').showBusy({ text: 'Even geduld: ophalen van data...' });
        wmsCapStore.baseParams = params;
        wmsCapStore.load();
        if (title != null) { wmsGrid.setTitle(title); }
    }

    function showCapabilitiesGrid() {

        if (wmsWin) {
            wmsWin.show(this);
            return;
        }

        // row expander: show details when user clicks on '+'
        var expSources = new Ext.ux.grid.RowExpander({
            tpl: new Ext.Template(
            '<p><b>URL:</b> <a href="{url}request=getcapabilities&service=wms" target="_blank">{url}</a><br/><b>Description:</b> {description}</p>'
            )
        });

        var expWms = new Ext.ux.grid.RowExpander({
            tpl: new Ext.Template(
            '<p><b>Abstract:</b> {abstract}</p>'
            )
        });

        // row actions: image column
        var actionSources = new Ext.ux.grid.RowActions({
            header: ''
			, keepSelection: true
			, actions: [{
			    iconCls: 'icon-load'
				, tooltip: 'Haal lagen op'
			}]
        });

        actionSources.on({
            action: function (grid, record, action, row, col) {
                // check if we have a login/password saved for this site
                var p = pwdDict.Lookup(record.data.url);
                var url = record.data.url;
                //                if (cbversions.value != undefined)
                //                    url += "&VERSION=" + cbversions.value;
                if (p) {
                    LoadWithLogin(record.data.name, url, p.login, p.password);
                }
                else {
                    LoadWithoutLogin(record.data.name, url);
                }
                Ext.getCmp('tool_voeglaagtoe').disable();
            }
        });

        // define sources grid
        sourcesGrid = new Ext.grid.GridPanel({
            title: "WMS Sources\n"
            , store: wmsSourcesStore
            , cm: new Ext.grid.ColumnModel([
                expSources,
                { header: "Name", dataIndex: "name", sortable: true, id: "name" },
                actionSources
                ])
            , sm: new Ext.grid.RowSelectionModel({ singleSelect: true })
            , autoExpandColumn: "name"
            , plugins: [expSources, actionSources]
            , flex: 50
            , bbar: new Ext.ux.StatusBar({
                id: 'statusbar-sources',
                disabled: true,
                defaultText: 'Klaar',
                defaultIconCls: ''
                , items: [
                 {
                     text: 'Voeg URL toe',
                     iconCls: 'icon-add',
                     handler: function () { ShowSourceURLWindow(); }
                 }

                ]
            })
        });

        // define wms grid
        wmsGrid = new Ext.grid.GridPanel({
            title: "WMS Capabilities"
            , store: wmsCapStore
            , cm: new Ext.grid.ColumnModel([
                expWms,
                { header: "Name", dataIndex: "name", sortable: true },
                { header: "Title", dataIndex: "title", sortable: true, id: "title" },
                { header: "Queryable", dataIndex: "queryable", sortable: true, width: 70 }
                ])
            , sm: new Ext.grid.RowSelectionModel({ multiSelect: true
            , listeners: {
                selectionchange: {
                    fn: function (m) {
                        if (m.selections.length > 0) {
                            Ext.getCmp('tool_voeglaagtoe').enable();
                        } else {
                            Ext.getCmp('tool_voeglaagtoe').disable();
                        }
                    }
                }

            }
            })
            , autoExpandColumn: "title"
            , plugins: expWms
            , flex: 50
            , bbar: new Ext.ux.StatusBar({
                id: 'statusbar-wms',
                defaultText: 'Klaar',
                defaultIconCls: '',
                items: [{
                    id: 'tool_voeglaagtoe',
                    text: 'Voeg laag toe aan kaart',
                    iconCls: 'icon-add',

                    handler: function () { AddWMSLayerToMap(wmsGrid.getSelectionModel()); }
                }]
            })
            , listeners: {
                rowdblclick: mapPreview
            }
        });

        // define window
        wmsWin = new Ext.Window({
            title: "Voeg laag toe"
            , closeAction: 'hide'
            , layout: 'hbox'
            , layoutConfig: { align: 'stretch' }
            , width: 800
            , height: 350
            , modal: true
            , items: [sourcesGrid, wmsGrid]
            , listeners: {
                hide: function (win) {
                    wmsGrid.getSelectionModel().clearSelections();
                }
            }
        });

        // show busy message
        Ext.getCmp('statusbar-sources').showBusy({ text: 'Even geduld: ophalen van data...' });

        // load sources
        wmsSourcesStore.load({ callback: function (records, options, success) { if (!success) { alert("Could not download service list"); } } });

        wmsWin.show();
    }

    // url window (shown when user clicks on "add url")
    var urlWin;
    function ShowSourceURLWindow() {
        if (urlWin) {
            urlWin.show(this);
            return;
        }

        // define form
        var urlForm = new Ext.FormPanel({
            labelWidth: 50,
            frame: true,
            bodyStyle: 'padding: 5px 5px 0',
            defaultType: 'textfield',
            items: [
            {
                fieldLabel: 'Name',
                name: 'name',
                allowBlank: false,
                width: 200
            }, {
                fieldLabel: 'URL',
                name: 'url',
                allowBlank: false,
                value: 'http://',
                width: 240
            }],
            buttons: [{
                text: 'Annuleren',
                handler: function () {
                    urlWin.hide();
                }
            }, {
                text: 'Voeg toe',
                handler: function () {
                    if (!urlForm.getForm().findField('name').isValid() || !urlForm.getForm().findField('url').isValid() || urlForm.getForm().findField('url').getValue() == 'http://') {
                        msg('Validatie', 'Vul beide velden in!');
                        return;
                    }
                    urlWin.hide();
                    AddSourceURL(urlForm.getForm().findField('name').getValue(), urlForm.getForm().findField('url').getValue());
                }
            }]
        });

        // define window
        urlWin = new Ext.Window({
            title: 'Voeg URL toe'
            , closeAction: 'hide'
            , layout: 'fit'
            , modal: true
            , width: 350
            , height: 160
            , plain: true
            , border: false
            , items: [urlForm]
        });

        urlWin.show();
    }

    var recID = 1;
    function AddSourceURL(name, url) {
        var newData = { name: name, url: url, description: 'WMS source toegevoegd door gebruiker' };
        recID++;
        var p = new wmsSourcesStore.recordType(newData, "YouDidIt" + recID);
        wmsSourcesStore.add(p);
    }



    /****************************
    ***  Add & Remove layers  ***
    ****************************/

    function AddWMSLayerToMap(record) {
        if (record.selections.length > 0) {
            for (i = 0; i < record.selections.length; i++) {
                var clone = record.selections.items[i].clone();


                p = pwdDict.Lookup(record.selections.items[0].data.layer.url + "?");
                if (p) {
                    var password = p.password;
                    var login = p.login;
                }


                clone.get("layer").mergeNewParams({
                    format: "image/png",
                    transparent: true
               , isBaseLayer: false
               , usr: login
               , pwd: password
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


                mapPanel.layers.add(clone);


            }
            //wmsWin.hide();
        }
    }



    function delLayer() {

        var node = layerPanel.getSelectionModel().getSelectedNode();
        // base layers & vector layer cannot be removed
        if (node && node.layer && !node.layer.isBaseLayer && node.layer.name != 'Vector') {
            var layer = node.layer;
            var store = node.layerStore;
            var record = store.getAt(store.findBy(function (record) {
                return record.get("layer") === layer;
            }));
            store.remove(record);
            removeLayerAction.disable();
            mapPanel.getBottomToolbar().get('lblInfo').setText("");
        }
    }
    function delLayers() {
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
            mapPanel.getBottomToolbar().get('lblInfo').setText("");
        }
        removeLayerAction.disable();
    }

    function allLayersVisible(v) {
        var wmsnodes = layerPanel.root.childNodes[0].childNodes;
        for (var i = 0; i < wmsnodes.length; i++) {
            var wmsnode = wmsnodes[i];
            var layer = wmsnode.layer;
            layer.setVisibility(v);
            //            var store = wmsnode.layerStore;
            //            var record = store.getAt(store.findBy(function (record) {
            //                return record.get("layer") === layer;
            //            }));
            //            store.remove(record);
        }
        removeLayerAction.disable();
    }
    function allLayersInvisible() {
        var wmsnodes = layerPanel.root.childNodes[0].childNodes;
        for (var i = 0; i < wmsnodes.length; i++) {
            var wmsnode = wmsnodes[i];
            var layer = wmsnode.layer;
            layer.setVisibility(false);
        }
        removeLayerAction.disable();
    }


    function mapPreview(grid, index) {
        var record = grid.getStore().getAt(index);
        var layer = record.getLayer().clone();
        var win = new Ext.Window({
            title: "Preview: " + record.get("title"),
            width: 512,
            height: 256,
            layout: "fit",
            items: [{
                xtype: "gx_mappanel",
                layers: [layer],
                projection: map_projection,
                extent: record.get("llbbox")
            }]
        });
        win.show();
    }



    var root = new Ext.tree.TreeNode({
        text: "Sommige Inspire lagen"
        , expanded: true
        , loader: new GeoExt.tree.LayerLoader({
            applyLoader: true
        })
    });







    var rootAE = new Ext.tree.AsyncTreeNode({
        text: 'Administratieve eenheden',
        loader: new GeoExt.tree.WMSCapabilitiesLoader({
            url: OpenLayers.ProxyHost + 'http://wms.agiv.be/inspire/wms/administratieve_eenheden?',
            layerOptions: { buffer: 0, singleTile: true, ratio: 1 },
            layerParams: { 'TRANSPARENT': 'TRUE' },
            createNode: function (attr) {
                attr.checked = attr.leaf ? false : undefined;
                return GeoExt.tree.WMSCapabilitiesLoader.prototype.createNode.apply(this, [attr]);
            }
        })
    });

    var rootBG = new Ext.tree.AsyncTreeNode({
        text: 'Beschermde gebieden',
        loader: new GeoExt.tree.WMSCapabilitiesLoader({
            url: OpenLayers.ProxyHost + 'http://wms.agiv.be/inspire/wms/beschermde_gebieden?',
            layerOptions: { buffer: 0, singleTile: true, ratio: 1 },
            layerParams: { 'TRANSPARENT': 'TRUE' },
            createNode: function (attr) {
                attr.checked = attr.leaf ? false : undefined;
                return GeoExt.tree.WMSCapabilitiesLoader.prototype.createNode.apply(this, [attr]);
            }
        })
    });

    var rootHY = new Ext.tree.AsyncTreeNode({
        text: 'Hydrografie',
        loader: new GeoExt.tree.WMSCapabilitiesLoader({
            url: OpenLayers.ProxyHost + 'http://wms.agiv.be/inspire/wms/hydrografie?',
            layerOptions: { buffer: 0, singleTile: true, ratio: 1 },
            layerParams: { 'TRANSPARENT': 'TRUE' },
            createNode: function (attr) {
                attr.checked = attr.leaf ? false : undefined;
                return GeoExt.tree.WMSCapabilitiesLoader.prototype.createNode.apply(this, [attr]);
            }
        })
    });

    var rootOB = new Ext.tree.AsyncTreeNode({
        text: 'Orthobeeldvorming',
        loader: new GeoExt.tree.WMSCapabilitiesLoader({
            url: OpenLayers.ProxyHost + 'http://wms.agiv.be/inspire/wms/orthobeeldvorming?',
            layerOptions: { buffer: 0, singleTile: true, ratio: 1 },
            layerParams: { 'TRANSPARENT': 'TRUE' },
            createNode: function (attr) {
                attr.checked = attr.leaf ? false : undefined;
                return GeoExt.tree.WMSCapabilitiesLoader.prototype.createNode.apply(this, [attr]);
            }
        })
    });

    var rootEL = new Ext.tree.AsyncTreeNode({
        text: 'Hoogte',
        loader: new GeoExt.tree.WMSCapabilitiesLoader({
            url: OpenLayers.ProxyHost + 'http://wms.agiv.be/inspire/wms/hoogte?',
            layerOptions: { buffer: 0, singleTile: true, ratio: 1 },
            layerParams: { 'TRANSPARENT': 'TRUE' },
            createNode: function (attr) {
                attr.checked = attr.leaf ? false : undefined;
                return GeoExt.tree.WMSCapabilitiesLoader.prototype.createNode.apply(this, [attr]);
            }
        })
    });

    root.appendChild(rootAE);
    root.appendChild(rootBG);
    root.appendChild(rootHY);
    root.appendChild(rootEL);
    root.appendChild(rootOB);



    tree = new Ext.tree.TreePanel({
        root: root,
        region: 'west',
        width: 250,
        height: 1000,
        listeners: {
            // Add layers to the map when ckecked, remove when unchecked.
            // Note that this does not take care of maintaining the layer
            // order on the map.
            'checkchange': function (node, checked) {
                if (checked === true) {
                    mapPanel.map.addLayer(node.attributes.layer);
                } else {
                    mapPanel.map.removeLayer(node.attributes.layer);
                }
            }
        }
    });






















});                                                                                                   // END: Ext.onReady
            
            