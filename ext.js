var wmsGrid, sourcesGrid, wmsWin;
var pwdDict = new Dictionary();
var wmsSourcesStore = new Ext.data.Store({
  proxy: new Ext.data.HttpProxy({
    url: wmsSourcesUrl,
    method: 'GET'
  }),
  reader: new Ext.data.XmlReader({
    record: 'service',
    id: 'serviceReader'
  }, ['name', 'url', 'description']),
  listeners: {
    load: {
      fn: function() {
        Ext.getCmp('statusbar-sources').clearStatus({
          useDefaults: true
        });
        sourcesGrid.getBottomToolbar().setDisabled(false);
      }
    }
  }
});
var wmsCapStore = new GeoExt.data.WMSCapabilitiesStore({
  reader: new GeoExt.data.WMSCapabilitiesReader(),
  url: proxyUrl,
  listeners: {
    load: {
      fn: function(proxy, o, options) {
        Ext.getCmp('statusbar-wms').clearStatus({
          useDefaults: true
        });
        setTimeout(Racing.addLayers, Racing.addLayersTimeout);
      }
    },
    exception: {
      fn: function(proxy, type, action, options, response, arg) {
        if (response.status == '401') {
          Ext.getCmp('statusbar-wms').setStatus({
            text: 'Login vereist',
            iconCls: 'x-status-error'
          });
          ShowLoginForm(options.params.url);
        } else {
          Ext.getCmp('statusbar-wms').setStatus({
            text: 'Inladen is mislukt',
            iconCls: 'x-status-error'
          });
          msg('Fout bij inladen', arg);
        }
      }
    }
  }
});

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

function LoadWithoutLogin(title, url) {
  LoadCapabilities(title, {
    url: url,
    request: 'GetCapabilities'
  });
}

function LoadCapabilities(title, params) {
  wmsCapStore.removeAll();
  Ext.getCmp('statusbar-wms').showBusy({
    text: 'Even geduld: ophalen van data...'
  });
  wmsCapStore.baseParams = params;
  wmsCapStore.load();
  if (title != null) {
    wmsGrid.setTitle(title);
  }
}

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
        transparent: true,
        isBaseLayer: false,
        usr: login,
        pwd: password
      });
      clone.get("layer").setTileSize(new OpenLayers.Size(wmsLayerTileSize, wmsLayerTileSize)); // bigger, faster, stronger
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
        realminscale: realminscale,
        realmaxscale: realmaxscale
      });
      mapPanel.layers.add(clone);
    }
  }
}

function showCapabilitiesGrid() {
  if (wmsWin) {
    wmsWin.show(this);
    return;
  }
  var expSources = new Ext.ux.grid.RowExpander({
    tpl: new Ext.Template('<p><b>URL:</b> <a href="{url}request=getcapabilities&service=wms" target="_blank">{url}</a><br/><b>Description:</b> {description}</p>')
  });
  var expWms = new Ext.ux.grid.RowExpander({
    tpl: new Ext.Template('<p><b>Abstract:</b> {abstract}</p>')
  });
  var actionSources = new Ext.ux.grid.RowActions({
    header: '',
    keepSelection: true,
    actions: [{
      iconCls: 'icon-load',
      tooltip: 'Haal lagen op'
    }]
  });
  actionSources.on({
    action: function(grid, record, action, row, col) {
      var p = pwdDict.Lookup(record.data.url);
      var url = record.data.url;
      if (p) {
        LoadWithLogin(record.data.name, url, p.login, p.password);
      } else {
        LoadWithoutLogin(record.data.name, url);
      }
      Ext.getCmp('tool_voeglaagtoe').disable();
    }
  });
  sourcesGrid = new Ext.grid.GridPanel({
    title: "WMS Sources\n",
    store: wmsSourcesStore,
    cm: new Ext.grid.ColumnModel([
      expSources, {
        header: "Name",
        dataIndex: "name",
        sortable: true,
        id: "name"
      },
      actionSources
    ]),
    sm: new Ext.grid.RowSelectionModel({
      singleSelect: true
    }),
    autoExpandColumn: "name",
    plugins: [expSources, actionSources],
    flex: 50,
    bbar: new Ext.ux.StatusBar({
      id: 'statusbar-sources',
      disabled: true,
      defaultText: 'Klaar',
      defaultIconCls: '',
      items: [{
        text: 'Voeg URL toe',
        iconCls: 'icon-add',
        handler: function() {
          ShowSourceURLWindow();
        }
      }]
    })
  });
  wmsGrid = new Ext.grid.GridPanel({
    title: "WMS Capabilities",
    store: wmsCapStore,
    cm: new Ext.grid.ColumnModel([
      expWms, {
        header: "Name",
        dataIndex: "name",
        sortable: true
      }, {
        header: "Title",
        dataIndex: "title",
        sortable: true,
        id: "title"
      }, {
        header: "Queryable",
        dataIndex: "queryable",
        sortable: true,
        width: 70
      }
    ]),
    sm: new Ext.grid.RowSelectionModel({
      multiSelect: true,
      listeners: {
        selectionchange: {
          fn: function(m) {
            if (m.selections.length > 0) {
              Ext.getCmp('tool_voeglaagtoe').enable();
            } else {
              Ext.getCmp('tool_voeglaagtoe').disable();
            }
          }
        }
      }
    }),
    autoExpandColumn: "title",
    plugins: expWms,
    flex: 50,
    bbar: new Ext.ux.StatusBar({
      id: 'statusbar-wms',
      defaultText: 'Klaar',
      defaultIconCls: '',
      items: [{
        id: 'tool_voeglaagtoe',
        text: 'Voeg laag toe aan kaart',
        iconCls: 'icon-add',
        handler: function() {
          AddWMSLayerToMap(wmsGrid.getSelectionModel());
        }
      }]
    }),
    listeners: {
      rowdblclick: mapPreview
    }
  });
  wmsWin = new Ext.Window({
    title: "Voeg laag toe",
    closeAction: 'hide',
    layout: 'hbox',
    layoutConfig: {
      align: 'stretch'
    },
    width: 800,
    height: 350,
    modal: true,
    items: [sourcesGrid, wmsGrid],
    listeners: {
      hide: function(win) {
        wmsGrid.getSelectionModel().clearSelections();
      }
    }
  });
  Ext.getCmp('statusbar-sources').showBusy({
    text: 'Even geduld: ophalen van data...'
  });
  wmsSourcesStore.load({
    callback: function(records, options, success) {
      if (!success) {
        alert("Could not download service list");
      } else {
        setTimeout(function() {
          sourcesGrid.getSelectionModel().selectRow(0);
          var data = sourcesGrid.getSelectionModel().selections.items[0].data;
          LoadWithoutLogin(data.name, data.url);
        }, 0);
      }
    }
  });
  wmsWin.show();
}