var action = 'showGemeente';
window.onload = function() {
  var selects = document.querySelectorAll('select');
  for (var i = 0; i < selects.length; i++) {
    var id = selects[i].getAttribute('id');
    var selectedOptions = JSON.parse(window.localStorage.getItem('select_' + id));
    var options = selects[i].options;
    for (var j = 0; j < options.length; j++) {
      if (selectedOptions && selectedOptions.indexOf(selects[i].options[j].value) != -1) {
        options[j].selected = 'selected';
      } else {
        options[j].removeAttribute('selected');
      }
    }
    selects[i].onchange = function() {
      var selectedOptions = [];
      for (var j = 0; j < this.selectedOptions.length; j++) {
        selectedOptions.push(this.selectedOptions[j].value);
      }
      window.localStorage.setItem('select_' + this.getAttribute('id'), JSON.stringify(selectedOptions));
    };
  }
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
