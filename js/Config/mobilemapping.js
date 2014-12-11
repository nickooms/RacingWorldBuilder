
var urlMM = 'https://mobilemapping.agiv.be/gis/geoserver/ows?';
var initUserMM = "";
var initKeyMM = "";
var loginMMWin;
var urlPanoviewer = "https://mobilemapping.agiv.be/pano/?";
function startmobilemapping() {
    ShowMMLoginForm();
}

function ShowMMLoginForm() {


    // define form
    var loginMMForm = new Ext.FormPanel({
        labelWidth: 75,
        frame: true,
        title: 'Mobile Mapping toegang',
        bodyStyle: 'padding: 5px 5px 0',
        defaultType: 'textfield',
        items: [{
            fieldLabel: 'Usernaam',
            name: 'login',
            width: 200,
            value: initUserMM
        }, {
            fieldLabel: 'Paswoord',
            name: 'password',
            width: 200,
            value: initKeyMM,
            inputType: 'password'
        }],
        buttons: [{
            text: 'Annuleren',
            handler: function () {
                //loginWin.hide();
                loginMMWin.close();
            }
        }, {
            text: 'Log in',
            handler: function () {
                initUserMM = loginMMForm.getForm().findField('login').getValue();
                initKeyMM = loginMMForm.getForm().findField('password').getValue();


                var p = proxyUrlMM + '?url='+urlMM;

                if (initUserMM !== '' && initKeyMM !=='')
                {
                var mmLayer = new OpenLayers.Layer.WMS("MobileMapping", p, { layers: 'Agiv:MobileMapping', transparent: true, format: 'image/png', REALMINSCALE: '7500', REALMAXSCALE: '250', USR: initUserMM, PWD: initKeyMM }, { isBaseLayer: false, minScale: 7600, maxScale: 200 });

                //mmLayer.mergeNewParams({ SLD: 'http://ws.agiv.be/slds/promut.xml', STYLES: 'gdiviewer' });

                mmLayer.setTileSize(new OpenLayers.Size(256, 256));
                mmLayer.buffer = 2;

                map.addLayer(mmLayer);

                SetLayerActive(mmLayer, initUserMM, initKeyMM);
                loginMMWin.close();
                }
            }
        }]
    });

    // define window
    loginMMWin = new Ext.Window({
        closeAction: 'hide'
            , layout: 'fit'
            , modal: true
            , width: 320
            , height: 150
            , plain: false
            , border: false
            , items: [loginMMForm]
    });

    loginMMWin.show();
}



function getfeatureinfoMM(event) {


    if (event && event.text && event.text.length > 0 && event.text.indexOf("no features were found")==(-1)) {
        var id1 = event.text.indexOf("id = ");
        var id2 = event.text.indexOf("filelocation");
        var id = event.text.substring(id1 + 5, id2);
        var xy=map.getLonLatFromPixel(event.xy);
        var deurl = "<a href=" + urlPanoviewer + "x=" + Math.round(xy.lon) + "&y=" + Math.round(xy.lat) + "&id=" + id + "" + " target=_blank>" + id + "</a>";
        map.addPopup(new OpenLayers.Popup.FramedCloud(
                    'infopopup',
                    xy,
                    null,
                    deurl,
                    null,
                    true
                ));
    }



}