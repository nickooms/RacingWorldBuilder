var action, actions = {};

if (useMeasure) {
    var lengteField = new Ext.form.TextField({
        id: 'tbLen',
        width: 75,
        readOnly: true
    })

    var oppField = new Ext.form.TextField({
        id: 'tbOpp',
        width: 75,
        readOnly: true
    })
}


/***************************
***     Top Toolbar     ***
***************************/

var toggleGroup = 'my map controls';

function GenerateTopToolbar() {

    var topToolbarItems = [];
    if (useNavigationButtons) {
        // Pan
        action = new GeoExt.Action({
            control: new OpenLayers.Control.Navigation(),
            map: map,
            toggleGroup: toggleGroup,
            allowDepress: false,
            pressed: true,
            tooltip: "Pan",
            icon: 'img/pan.png',
            checked: true
        });
        actions["pan"] = action;
        topToolbarItems.push(action);
        // Divider
        topToolbarItems.push("-");
        // Zoom to extent
        var zoomExtButton = new Ext.Button({
            tooltip: "Zoom naar extent",
            iconCls: "bzoomoutall",
            handler: function () {
                var extent, layer;
                for (var i = 0, len = mapPanel.map.layers.length; i < len; ++i) {
                    layer = this.map.layers[i];
                    if (layer.getVisibility()) {
                        if (extent) {
                            extent.extend(layer.maxExtent);
                        } else {
                            extent = layer.maxExtent.clone();
                        }
                    }
                }
                if (extent) {
                    mapPanel.map.zoomToExtent(extent);
                }
            },
            scope: this
        });
        actions["zoomtoextent"] = zoomExtButton;
        topToolbarItems.push(zoomExtButton);

        // zoom in
        action = new GeoExt.Action({
            iconCls: 'bzoomin',
            control: new OpenLayers.Control.ZoomIn(),
            map: map,
            tooltip: "Zoom in"
        });
        actions["zoomin"] = action;
        topToolbarItems.push(action);

        // zoom out
        action = new GeoExt.Action({
            iconCls: 'bzoomout',
            control: new OpenLayers.Control.ZoomOut(),
            map: map,
            tooltip: "Zoom uit"
        });
        actions["zoomout"] = action;
        topToolbarItems.push(action);

        // zoom box
        action = new GeoExt.Action({
            icon: 'img/ZoomToBox.png',
            control: new OpenLayers.Control.ZoomBox(),
            enableToggle: true,
            toggleGroup: toggleGroup,
            map: map,
            tooltip: "Zoom naar kader"
        });
        actions["zoombox"] = action;
        topToolbarItems.push(action);

        // History - back
        if (useHistory) {
            action = new GeoExt.Action({
                iconCls: 'back',
                control: navHistory.previous,
                disabled: true,
                tooltip: "Zoom naar vorige"
            });
            actions["previous"] = action;
            topToolbarItems.push(action);

            // History - next
            action = new GeoExt.Action({
                iconCls: 'next',
                control: navHistory.next,
                disabled: true,
                tooltip: "Zoom naar volgende"
            });
            actions["next"] = action;
            topToolbarItems.push(action);

            // Divider
            topToolbarItems.push("-");
        }
    }


// OM TIJDENS HET TEKENEN CTRL_Z, CTRL_Y TE GEBRUIKEN
//    OpenLayers.Event.observe(document, "keydown", function (evt) {
//        var handled = false;
//        switch (evt.keyCode) {
//            case 90: // z
//                if (evt.metaKey || evt.ctrlKey) {
//                    draw.undo();
//                    handled = true;
//                }
//                break;
//            case 89: // y
//                if (evt.metaKey || evt.ctrlKey) {
//                    draw.redo();
//                    handled = true;
//                }
//                break;
//            case 27: // esc
//                draw.cancel();
//                handled = true;
//                break;
//        }
//        if (handled) {
//            OpenLayers.Event.stop(evt);
//        }
//    });






    if (useDrawVector) {
        // Draw Polygon
        action = new GeoExt.Action({
            control: new OpenLayers.Control.DrawFeature(
                vecLayer, OpenLayers.Handler.Polygon
            ),
            map: map,
            toggleGroup: toggleGroup,
            allowDepress: false,
            tooltip: "Teken polygoon",
            iconCls: 'drawpolygon'
        });
        actions["draw_poly"] = action;
        topToolbarItems.push(action);


        // Draw path
        action = new GeoExt.Action({
            iconCls: 'drawline',
            control: new OpenLayers.Control.DrawFeature(
                vecLayer, OpenLayers.Handler.Path
            ),

            map: map,
            toggleGroup: toggleGroup,
            allowDepress: false,
            tooltip: "Teken lijn"
        });
        actions["draw_line"] = action;
        topToolbarItems.push(action);

        // Draw point
        action = new GeoExt.Action({
            iconCls: 'drawpoint',
            control: new OpenLayers.Control.DrawFeature(
                vecLayer, OpenLayers.Handler.Point
            ),
            map: map,
            toggleGroup: toggleGroup,
            allowDepress: false,
            tooltip: "Teken punt"
        });
        actions["draw_point"] = action;
        topToolbarItems.push(action);


        // modify
        action = new GeoExt.Action({
            //text: 'Editeren',
            iconCls: 'modify',
            control: new OpenLayers.Control.ModifyFeature(
                vecLayer, { title: 'Edit feature' }
            ),
            map: map,
            toggleGroup: toggleGroup,
            allowDepress: false,
            tooltip: "Editeer"
        });
        actions["modify"] = action;
        topToolbarItems.push(action);

        // wis
        action = new GeoExt.Action({
            //text: 'Select',
            iconCls: 'select',
            control: new OpenLayers.Control.SelectFeature(
                vecLayer, { title: 'Select feature' }
            ),
            map: map,
            toggleGroup: toggleGroup,
            allowDepress: false,

            tooltip: "Selecteer"

        });
        actions["Select"] = action;
        topToolbarItems.push(action);

        // Erase vector layer
        action = new GeoExt.Action({
            //text: 'Wissen',
            iconCls: 'deleteselected',
            handler: function () {
                vecLayer.removeFeatures(vecLayer.selectedFeatures);
            },
            tooltip: 'Wis selectie in vector laag'
        });
        actions["Wis"] = action;
        topToolbarItems.push(action);

        // Erase vector layer
        action = new GeoExt.Action({
            //text: 'Wissen',
            iconCls: 'delete',
            handler: function () {
                vecLayer.removeFeatures(vecLayer.features);
            },
            tooltip: 'Wis vector laag'
        });
        actions["Wis"] = action;
        topToolbarItems.push(action);

        // Divider
        topToolbarItems.push("-");
    }
    if (useMeasure) {
        // measure length
        var lengthButton = new Ext.Button({
            icon: 'img/ruler.png',
            tooltip: 'Meet een afstand op de kaart',
            enableToggle: true,
            toggleGroup: toggleGroup,
            listeners: {
                toggle: function (btn, toggled) {
                    if (toggled) {
                        length.activate();
                    } else {
                        length.deactivate();
                    }
                }
            }
        });
        actions["length"] = lengthButton;
        topToolbarItems.push(lengthButton);
        topToolbarItems.push(lengteField);

        // Divider
        topToolbarItems.push("-");

        // measure area
        var areaButton = new Ext.Button({
            icon: 'img/ruler_square.png',
            tooltip: 'Bereken een oppervlakte op de kaart',
            enableToggle: true,
            toggleGroup: toggleGroup,
            listeners: {
                toggle: function (btn, toggled) {
                    if (toggled) {
                        area.activate();
                    } else {
                        area.deactivate();
                    }
                }
            }
        });
        actions["area"] = areaButton;
        topToolbarItems.push(areaButton);
        topToolbarItems.push(oppField);


        // Divider
        topToolbarItems.push("-");
    }
    if (useInfo) {
        // Info
        var infoButton = new Ext.Button({
            iconCls: 'info',
            tooltip: 'Identificeer een feature op de actieve laag',
            enableToggle: true,
            toggleGroup: toggleGroup,
            listeners: {
                toggle: function (btn, toggled) {
                    if (toggled) {
                        wmsfeatureinfo.activate();
                        if( mapPanel.getBottomToolbar().get('lblInfo').text=="")
                            Ext.MessageBox.alert('Let op!', 'Er is geen actieve laag', function () {
                                return true;
                            });

                    } else {
                        wmsfeatureinfo.deactivate();
                    }
                }
            }
        });
        actions["info"] = infoButton;
        topToolbarItems.push(infoButton);
        topToolbarItems.push("-");
    }
    /*
    // Divider
    topToolbarItems.push("-");

    // Config/ NIET GEIMPLEMENTEERD OMDAT HET OP DEZE MANIER NIET MOGELIJK IS
    var saveConfigButton = new Ext.Button({
    text: 'Config bewaren',
    tooltip: 'Configuratie bewaren',
    enableToggle: false,
    handler: SaveConfiguration,
    scope: this
    });
    actions["saveconfig"] = saveConfigButton;
    topToolbarItems.push(saveConfigButton);
    */

    if (useImportExport) {
        // Import/Export
        topToolbarItems.push({
            text: 'Import/Export',
            menu: new Ext.menu.Menu({
                items: [
                        new Ext.Action({
                            tooltip: 'Exporteer vector laag naar GML',
                            text: 'Exporteer vector laag',
                            icon: 'img/picture_go.png',
                            handler: ExportVectorLayer,
                            scope: this
                        }),
                        new Ext.Action({
                            tooltip: 'Importeer GML als vector laag',
                            text: 'Importeer vector laag',
                            icon: 'img/picture_come.png',
                            handler: ImportVectorLayer,
                            scope: this
                        })
                    ]
            })
        });

        topToolbarItems.push("-");
    }


    if (useConfigureer) {
        // Import/Export
        topToolbarItems.push({
            text: 'Configureer',
            menu: new Ext.menu.Menu({
                items: [
                        new Ext.Action({
                            tooltip: 'Configureer',
                            text: 'Configureer',
                            //icon: 'img/picture_go.png',
                            handler: Conf_Configureer,
                            scope: this
                        }),
                        new Ext.Action({
                            tooltip: 'Herstel',
                            text: 'Herstel',
                            //icon: 'img/picture_come.png',
                            handler: Conf_Herstel,
                            scope: this
                        })
                    ]
            })
        });

        topToolbarItems.push("-");
    }

    // Help
    topToolbarItems.push({
        text: 'Help',
        icon: 'img/help.png',
        menu: new Ext.menu.Menu({
            items: [
                        new Ext.Action({
                            tooltip: 'Toon help over de tools',
                            text: 'Tools',
                            icon: 'img/help.png',
                            handler: function () { ShowHtmlWindow('help_tools.html', 'Help - Tools', 640, 450); },
                            scope: this
                        }),
                        new Ext.Action({
                            tooltip: 'Toon help over de lagen',
                            text: 'Lagen',
                            icon: 'img/help.png',
                            handler: function () { ShowHtmlWindow('help_lagen.html', 'Help - Lagen', 640, 480); },
                            scope: this
                        }),
                        '-',
                        new Ext.Action({
                            tooltip: 'Info over deze applicatie',
                            text: 'Info',
                            icon: 'img/help.png',
                            handler: function () { ShowHtmlWindow('help_about.html', 'Help - Info', 400, 190); },
                            scope: this
                        })
                    ]
        })
    });

    return topToolbarItems;
}


/**************************
***   Bottom Toolbar   ***
**************************/

function GenerateBottomToolbar() {

    var bottomToolbarItems = [];

    // Zoom
    if (!issimple) {
        bottomToolbarItems.push("Zoom: ");
    }
    scaleStore = new GeoExt.data.ScaleStore({ map: map });
    zoomSelector = new Ext.form.ComboBox({
        width: 125,
        store: scaleStore,
        emptyText: "Zoom Level",
        tpl: '<tpl for="."><div class="x-combo-list-item">1 : {[Math.round(parseFloat(values.scale))]}</div></tpl>',
        editable: false,
        triggerAction: 'all', // needed so that the combo box doesn't filter by its current content
        mode: 'local' // keep the combo box from forcing a lot of unneeded data refreshes
    });
    zoomSelector.on('select', function (combo, record, index) { map.zoomTo(record.data.level); }, this);
    if (!issimple) {
        bottomToolbarItems.push(zoomSelector);


        // Divider
        bottomToolbarItems.push(new Ext.Toolbar.Spacer({ width: 10 }));

        // Projectie veld
        bottomToolbarItems.push(new Ext.form.Label({ text: 'Projectie:' }));
        bottomToolbarItems.push(new Ext.Toolbar.Spacer());
        bottomToolbarItems.push(new Ext.form.Label({
            id: 'lblProjection',
            text: ' ',
            width: 80,
            style: 'color: #0066FF; font-style: italic'
        }));

        // Divider
        bottomToolbarItems.push(new Ext.Toolbar.Spacer({ width: 5 }));
        bottomToolbarItems.push("-");
        bottomToolbarItems.push(new Ext.Toolbar.Spacer({ width: 5 }));
    }
    // X & Y velden
    bottomToolbarItems.push(new Ext.form.Label({ text: 'X:' }));
    bottomToolbarItems.push(new Ext.Toolbar.Spacer());
    bottomToolbarItems.push(new Ext.form.Label({
        id: 'lblLon',
        text: ' ',
        width: 80,
        style: 'color: #0066FF; font-style: italic'
    }));

    bottomToolbarItems.push(new Ext.Toolbar.Spacer({ width: 5 }));

    bottomToolbarItems.push(new Ext.form.Label({ text: 'Y:' }));
    bottomToolbarItems.push(new Ext.Toolbar.Spacer());
    bottomToolbarItems.push(new Ext.form.Label({
        id: 'lblLat',
        text: ' ',
        width: 80,
        style: 'color: #0066FF; font-style: italic'
    }));
    if (!issimple) {
        // Divider
        bottomToolbarItems.push(new Ext.Toolbar.Spacer({ width: 5 }));
        bottomToolbarItems.push("-");
        bottomToolbarItems.push(new Ext.Toolbar.Spacer({ width: 5 }));

        // Actieve laag
        bottomToolbarItems.push(new Ext.form.Label({ text: 'Actieve laag:' }));
        bottomToolbarItems.push(new Ext.Toolbar.Spacer());
        bottomToolbarItems.push(new Ext.form.Label({
            id: 'lblInfo',
            text: '',
            autoWidth: true,
            style: 'color: #0066FF; font-style: italic'
        }));
    }
    return bottomToolbarItems;
}