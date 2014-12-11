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
            port.postMessage({
              action: 'showGemeente',
              gemeenteNaam: document.querySelector('select#gemeente').value,
              straatNaam: document.querySelector('select#straat').value,
              k: document.querySelector('select#k').value,
              zoomToScale: parseInt(document.querySelector('select#zoomToScale').value),
              straatLine: parseInt(document.querySelector('select#straatLine').value),
              straatLinePoint: parseInt(document.querySelector('select#straatLinePoint').value),
              layer: layer.value,
              layerName: layer.options[layer.selectedIndex].innerText
            });
            break;
          case 'copyLayer':
            port.postMessage({
              action: 'copyLayer',
              gemeenteNaam: document.querySelector('select#gemeente').value,
              straatNaam: document.querySelector('select#straat').value,
              k: document.querySelector('select#k').value,
              layer: layer.value,
              layerName: layer.options[layer.selectedIndex].innerText
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
