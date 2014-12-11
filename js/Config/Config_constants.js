//// base layer urls
var urlStreets = 'http://wms.agiv.be/ogc/wms/navstreets?';
//var urlOrtho = 'http://wms.agiv.be/ogc/wms/orthoklm?';
var urlOrtho = 'http://geo.agiv.be/ogc/wms/omkl?';
//var urlGRB = 'http://wms.agiv.be/ogc/wms/grb?';
var urlGRB = 'http://grb.agiv.be/geodiensten/raadpleegdiensten/GRB-basiskaart/wms?';
var urlGRBgr = 'http://grb.agiv.be/geodiensten/raadpleegdiensten/GRB-basiskaart/wmsgr?';
var urlGem = 'http://geo.agiv.be/ogc/wms/vrbg?'
var urlGemWFS = 'http://wms.agiv.be/ogc/wfs/vrbg?'

var appChoice;
//appChoice = "develop";
//appChoice = "testbed";
appChoice = "production";
var Iamdeveloping = false;


// proxy host (necessary because javascript does not allow cross-domain calls)
if (appChoice == "develop") {
    var proxyUrl = 'Proxy/RegularProxy.ashx';
    //var proxyUrl = 'http://aocws945/proxyXX/Proxy/RegularProxy.ashx';
    //var proxyUrlMM = 'http://aocws945/Proxy/RegularProxyMM.ashx';
    var proxyUrlMM = 'Proxy/RegularProxyMM.ashx';
    var proxyUrlWFS = 'Proxy/RegularProxyWFS.ashx?url=';
    OpenLayers.ProxyHost = 'Proxy/RegularProxy.ashx?url=';
    //OpenLayers.ProxyHost = 'http://aocws945/proxyXX/Proxy/RegularProxy.ashx?url=';
    // URL to Crab Service
    var CrabUrl2 = 'proxy/regularproxycrab.ashx?url=http://aocsrv34/CRABREST/crab.svc';
    var CapakeyUrl = 'proxy/regularproxycrab.ashx?url=http://aocsrv34/CAPAKEYREST/capakey.svc';
    // base layer urls
    var urlStreets = 'http://ogc.beta.agiv.be/ogc/wms/navstreets?';
    var urlOrtho = 'http://ogc.beta.agiv.be/ogc/wms/omkl?';
    //var urlGRB = 'http://ogc.beta.agiv.be/ogc/wms/grb?';
    var urlGRB = 'http://grb.agiv.be/geodiensten/raadpleegdiensten/GRB-basiskaart/wms?';
    var urlGRBgr = 'http://grb.agiv.be/geodiensten/raadpleegdiensten/GRB-basiskaart/wmsgr?';
    var urlGem = 'http://geo.agiv.be/ogc/wms/vrbg?'
    var urlGemWFS = 'http://ogc.beta.agiv.be/ogc/wfs/vrbg?'
} else if (appChoice == "testbed") {
    var proxyUrl = '/proxy34/Proxy/RegularProxy.ashx';
    var proxyUrlMM = '/proxy34/Proxy/RegularProxyMM.ashx';
    OpenLayers.ProxyHost = '/proxy34/Proxy/RegularProxy.ashx?url=';
    // URL to Crab Service
    var CrabUrl2 = 'proxy/regularproxycrab.ashx?url=http://aocsrv34/CRABREST/crab.svc';
    var CapakeyUrl = 'proxy/regularproxycrab.ashx?url=http://aocsrv34/CAPAKEYREST/capakey.svc';
    // base layer urls
    var urlStreets = 'http://ogc.beta.agiv.be/ogc/wms/navstreets?';
    var urlOrtho = 'http://nlbtest.agiv.be/ogc/wms/omkl?';
    //var urlGRB = 'http://ogc.beta.agiv.be/ogc/wms/grb?';
    var urlGRB = 'http://grb.agiv.be/geodiensten/raadpleegdiensten/GRB-basiskaart/wms?';
    var urlGRBgr = 'http://grb.agiv.be/geodiensten/raadpleegdiensten/GRB-basiskaart/wmsgr?';
    var urlGem = 'http://nlbtest.agiv.be/ogc/wms/vrbg?'
    var urlGemWFS = 'http://ogc.beta.agiv.be/ogc/wfs/vrbg?'
} else if (appChoice == "production") {
    var proxyUrl = '/proxy88/Proxy/RegularProxy.ashx';
    var proxyUrlMM = '/proxy88/Proxy/RegularProxyMM.ashx';
    OpenLayers.ProxyHost = '/proxy88/Proxy/RegularProxy.ashx?url=';
    // URL to Crab Service
    var CrabUrl2 = 'proxy/regularproxycrab.ashx?url=http://aocsrv88/CRABREST/crab.svc';
    var CapakeyUrl = 'proxy/regularproxycrab.ashx?url=http://aocsrv88/CAPAKEYREST/capakey.svc';
    // base layer urls
    var urlStreets = 'http://geo.agiv.be/ogc/wms/navstreets?';
    var urlOrtho = 'http://geo.agiv.be/ogc/wms/omkl?';
    //var urlGRB = 'http://wms.agiv.be/ogc/wms/grb?';
    var urlGRB = 'http://grb.agiv.be/geodiensten/raadpleegdiensten/GRB-basiskaart/wms?';
    var urlGRBgr = 'http://grb.agiv.be/geodiensten/raadpleegdiensten/GRB-basiskaart/wmsgr?';
    var urlGem = 'http://geo.agiv.be/ogc/wms/vrbg?'
    var urlGemWFS = 'http://wms.agiv.be/ogc/wfs/vrbg?'
}

// wms sources
var wmsSourcesUrl = 'xml/ServiceList.xml';

// urls used for export & import of vector layer
var exportVectorUrl = 'Ajax/SaveFile.ashx';
var importVectorUrl = 'Ajax/ReadFile.ashx';

//initial user and pwd
var initUser = "login";
var initKey = "webkey";

//Configuratie van de viewport
var useLayerPanel = true;
var useLegendPanel = true;
var useSearchPanel = true;
var useCapasearchPanel = true;
var useCoordinatenPanel = true;
var useOverviewMap = true;
var useZoomPanel = true;
var useNavigation = true;
var usePanPanel = true;
var useZoomSlider = true;
var useNavigationButtons = true
var useProjection = "Lambert";
//var useProjection = "WGS84";
hu = window.location.search.substring(1);
gy = hu.split("&");
for (i = 0; i < gy.length; i++) {
    ft = gy[i].split("=");
    if (ft[0].toLowerCase() == "srswgs84" && ft[1].toLowerCase() == "true") {
        useProjection = "WGS84";
        break;
    }
}


if (useProjection == "Lambert"){
    var map_units= "m";
    var map_projection= new OpenLayers.Projection("EPSG:31370".toUpperCase());
    var map_maxExtent = new OpenLayers.Bounds.fromArray([22000, 150000, 259000, 245000]);
}
if (useProjection == "WGS84") {
    var map_units = "degrees";
    var map_projection = new OpenLayers.Projection("EPSG:4326".toUpperCase());
    //var map_maxExtent = new OpenLayers.Bounds.fromArray([2.5, 49.25, 6, 52.75]);
    var map_maxExtent = new OpenLayers.Bounds.fromArray([2.5, 50.65, 5.92, 51.6]);
}
//height/width
var heightLogoPanel = 75;
var heightLegendPanel = 350;
var widthDataPanel = 250;

var titleLegendPanel = "Legende";


//Tilesizes,buffers,singletile
var baseLayerTileSize=512;
var baseLayerBuffer=0;

var wmsLayerTileSize = 512;
var wmsLayerBuffer = 0;

//Configuratie Top Toolbar
var useHistory = true;
var useDrawVector = true;
var useMeasure = true;
var useInfo = true;
var useImportExport = true;
var useConfigureer = false;
var issimple = false;
var scales = [800000.0, 700000.0, 600000.0, 500000.0, 400000.0, 300000.0, 250000.0, 200000.0, 100000.0, 75000.0, 50000.0, 40000.0, 30000.0, 25000.0, 20000.0, 15000.0, 10000.0, 7500.0, 5000.0, 4000.0, 3000.0, 2500.0, 2000.0, 1500.0, 1000.0, 750.0, 500.0, 400.0, 300.0, 250.0];
var resolutions = null;
hu = window.location.search.substring(1);
gy = hu.split("&");
for (i = 0; i < gy.length; i++) {
    ft = gy[i].split("=");
    if (ft[0].toLowerCase() == "simple" && ft[1].toLowerCase() == "true") {
        useHistory = false;
        useDrawVector = false;
        useMeasure = true;
        useInfo = false;
        useImportExport = false;
        useCapasearchPanel = true;
        useCoordinatenPanel = true;
        useLegendPanel = false;
        useLayerPanel = false;
        useOverviewMap = false;
        useConfigureer = false;
        useNavigationButtons = false;
        scales = null;
        if (useProjection == "Lambert")
            resolutions = [1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25, 0.125, 0.0625, 0.03125];
        if (useProjection == "WGS84")
            resolutions = [1.40625000000000000000, 0.70312500000000000000, 0.35156250000000000000, 0.17578125000000000000, 0.08789062500000000000, 0.04394531250000000000, 0.02197265625000000000, 0.01098632812500000000, 0.00549316406250000000, 0.00274658203125000000, 0.00137329101562500000, 0.00068664550781250000, 0.00034332275390625000, 0.00017166137695312500, 0.00008583068847656250, 0.00004291534423828120, 0.00002145767211914060, 0.00001072883605957030, 0.00000536441802978516, 0.00000268220901489258, 0.00000134110450744629, 0.00000067055225372315, 0.00000033527612686157];
        issimple = true;
        break;
    }
}
var laadhydrografie=false;
for (i = 0; i < gy.length; i++) {
    ft = gy[i].split("=");
    if (ft[0].toLowerCase() == "laadhydrografie" && ft[1].toLowerCase() == "true") {
        laadhydrografie = true;
        break;
    }
}

var usenewlayertree = false;
for (i = 0; i < gy.length; i++) {
    ft = gy[i].split("=");
    if (ft[0].toLowerCase() == "lt" && ft[1].toLowerCase() == "true") {
        usenewlayertree = true;
        break;
    }
}

var param_zoom = 0;
var param_lon = 0;
var param_lat = 0;
var param_nobaselayers = false;
for (i = 0; i < gy.length; i++) {
    ft = gy[i].split("=");
    if (ft[0].toLowerCase() == "zoom" ) {
        param_zoom = parseInt(ft[1]);
    } else if (ft[0].toLowerCase() == "lon") {
        param_lon = parseInt(ft[1]);
    } else if (ft[0].toLowerCase() == "lat") {
        param_lat = parseInt(ft[1]);
    }
    
}

var usemobilemapping = false;
for (i = 0; i < gy.length; i++) {
    ft = gy[i].split("=");
    if (ft[0].toLowerCase() == "mobilemapping" && ft[1].toLowerCase() == "true") {
        usemobilemapping = true;
        break;
    }
}

var useRVV = false;
for (i = 0; i < gy.length; i++) {
    ft = gy[i].split("=");
    if (ft[0].toLowerCase() == "rvv" && ft[1].toLowerCase() == "true") {
        useRVV = true;
        break;
    }
}