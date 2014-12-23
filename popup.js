var action = 'showGemeente';
window.onload = function() {
  var buttons = document.querySelectorAll('button');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].onclick = function() {
      switch (this.getAttribute('id')) {
        case 'OK':
          action = 'showGemeente';
          break;
        case 'Copy':
          action = 'copyLayer';
          break;
      }
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function(tabs) {
        var port = chrome.tabs.connect(tabs[0].id);
        switch (action) {
          case 'showGemeente':
            var layer = document.querySelector('select#layer');
            var layers = [];
            var layerNames = [];
            for (var j = 0; j < layer.selectedOptions.length; j++) {
              layers.push(layer.selectedOptions[j].value);
              layerNames.push(layer.selectedOptions[j].firstChild.nodeValue);
            }
            port.postMessage({
              action: 'showGemeente',
              gemeenteNaam: document.querySelector('select#gemeente').value,
              straatNaam: document.querySelector('select#straat').value,
              k: document.querySelector('select#k').value,
              zoomToScale: parseInt(document.querySelector('select#zoomToScale').value),
              straatLine: parseInt(document.querySelector('select#straatLine').value),
              straatLinePoint: document.querySelector('select#straatLinePoint').value,
              layer: layer.value,
              layerName: layer.options[layer.selectedIndex].firstChild.nodeValue,
              layers: layers,
              layerNames: layerNames
            });
            break;
          case 'copyLayer':
            port.postMessage({
              action: 'copyLayer',
              gemeenteNaam: document.querySelector('select#gemeente').value,
              straatNaam: document.querySelector('select#straat').value,
              k: document.querySelector('select#k').value,
              layer: layer.value,
              layerName: layer.options[layer.selectedIndex].firstChild.nodeValue
            });
            break;
        }
        port.onMessage.addListener(function getResp(response) {
          switch (response.action) {
            case 'closeMenu':
              chrome.pageAction.hide(tabs[0].id);
              break;
            case 'log':
              document.querySelector('ul#log').innerHTML += '<li>' + response.message + '</li>';
              break;
          }
        });
      })
    }
  }
}
