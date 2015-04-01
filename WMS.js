var WMS = function() {};
WMS.GRB = 'http://geo.api.agiv.be/geodiensten/raadpleegdiensten/GRB/wms?';
WMS.DHMV = 'http://geo.agiv.be/ogc/wms/product/DHMV?';//LAYERS=DHMVII_DSM_1m&format=image/png&transparent=true&version=1.3.0&service=WMS&request=GetMap&styles=&crs=EPSG:31370&bbox=152481,221808,152497,221827&width=160&height=190
WMS.url = function(layers) {
	switch (layers) {
		case 'DHMVII_DSM_1m':
			return WMS.DHMV;
		default:
			return WMS.GRB;
	}
};
WMS.getFeatureInfo = function(layers, width, height, bbox, x, y) {
	return new Promise(function(resolve, reject) {
		var parameters = {
  		LAYERS: layers || 'GRB_WKN',
  		QUERY_LAYERS: layers || 'GRB_WKN',
  		STYLES: '',
  		SERVICE: 'WMS',
  		VERSION: '1.3.0',
  		REQUEST: 'GetFeatureInfo',
  		EXCEPTIONS: 'XML',
  		BBOX: bbox,
  		FEATURE_COUNT: 10,
  		WIDTH: width,
  		HEIGHT: height,
  		FORMAT: 'image/png',
  		INFO_FORMAT: 'text/plain',
  		CRS: 'EPSG:31370',
  		I: x,
  		J: y
  	};
  	var params = [];
  	for (var paramName in parameters) {
  		params.push(paramName + '=' + parameters[paramName]);
  	}
  	var url = WMS.GRB + params.join('&');
  	var parseResults = function(results) {
  		
  		if (results.indexOf('Search returned no results.') == -1) {
	  		switch (parameters.LAYERS) {
	  			case 'GRB_WKN':
	  				resolve(Wegknoop.parse(results, parameters));
	  				break;
	  			case 'GRB_WVB':
	  				resolve(Wegverbindingen.parse(results, parameters));
	  				break;
	  			case 'GRB_WBN':
	  				//console.log(parameters.LAYERS);
	  				//console.log(results);
	  				var wegbaan = Wegbaan.parse(results, parameters);
	  				//$R.Wegbanen.remove();
	  				//console.log(wegbaan);
	  				if (!$R.Wegbanen.exists(wegbaan)) {
	  					$R.Wegbanen.add();
	  				}
	  				resolve(wegbaan);
	  				break;
	  		}
	  	} else {
	  		reject();
	  	}
  	};
		var cache = localStorage[url];
		if (cache === undefined) {
  		var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.onreadystatechange = function() {
			  if (xhr.readyState == 4) {
			  	localStorage[url] = xhr.responseText;
			  	parseResults(xhr.responseText);
			  }
			};
			xhr.send();
		} else {
			parseResults(cache);
		}
	});
};
WMS.getMap = function(layers, width, height, minX, minY, maxX, maxY, object) {
	var parameters = {
		layers: layers || 'GRB_basiskaart',
		format: 'image/png',
		transparent: 'true',
		version: '1.3.0',
		service: 'WMS',
		request: 'GetMap',
		styles: '',
		crs: 'EPSG:31370',
		bbox: [minX, minY, maxX, maxY].join(','),
		width: width || 1000,
		height: height || 1000
	};
	var params = [];
	for (var paramName in parameters) {
		params.push(paramName + '=' + parameters[paramName]);
	}
	var url = WMS.url(layers)/*WMS.GRB*/ + params.join('&');
	return new Promise(function(resolve, reject) {
		var processImageData = function(imageData) {
			//console.log(url);
			//console.log(imageData);
			var parameters = {};
			for (var param of url.replace(WMS.url(layers)/*WMS.GRB*/, '').split('&')) {
				param = param.split('=');
				parameters[param[0]] = param[1];
			}
			resolve({
				object: object,
				url: url,
				parameters: parameters,
				imageData: imageData
			});
		};
		var cache = localStorage[url];
		if (cache === undefined) {
  		var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.responseType = 'blob';
			xhr.onreadystatechange = function() {
			  if (xhr.readyState == 4) {
			    var img = new Image();
		  		img.onload = function(evt) {
		  			var image = evt.target;
		  			var width = image.width;
		  			var height = image.height;
		  			window.URL.revokeObjectURL(image.src);
		  			var canvas = document.createElement('canvas');
		  			canvas.width = width;
		  			canvas.height = height;
		  			var context = canvas.getContext('2d');
		  			context.drawImage(image, 0, 0);
		  			localStorage[xhr.responseURL] = canvas.toDataURL('image/png');
		  			var imageData = context.getImageData(0, 0, width, height);
		  			processImageData(imageData, xhr.responseURL);
		  		};
		  		var objectUrl = window.URL.createObjectURL(xhr.response);
			    img.src = objectUrl;
			  }
			};
			xhr.send();
		} else {
			var img = new Image();
  		img.onload = function(evt) {
  			var image = evt.target;
		  	var width = image.width;
		  	var height = image.height;
  			var canvas = document.createElement('canvas');
  			canvas.width = width;
		  	canvas.height = height;
  			var context = canvas.getContext('2d');
  			context.drawImage(image, 0, 0);
  			var imageData = context.getImageData(0, 0, width, height);
  			processImageData(imageData, url);
  		};
	    img.src = cache;
		}
	});
};