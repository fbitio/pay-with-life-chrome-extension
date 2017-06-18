function saveWage(event) {

	event.preventDefault();
	
	var wage = encodeURIComponent(document.getElementById('wageInput').value);
  var taxRate = encodeURIComponent(document.getElementById('taxRate').value);

  chrome.storage.sync.set({'hourlyWage': wage, 'taxRate': taxRate}, function(){});
  
  // reload page so that the changes take effect
  chrome.tabs.reload();

  window.close();

}

document.addEventListener('DOMContentLoaded', function() {

  // set value from cache if available
    chrome.storage.sync.get(['hourlyWage', 'taxRate'], function(items) {
      if (!chrome.runtime.error) {
        document.getElementById("wageInput").value = items.hourlyWage;
        document.getElementById("taxRate").value = items.taxRate;
      }
    });

    document.getElementById('popupsettings').addEventListener('submit', saveWage);
});

	