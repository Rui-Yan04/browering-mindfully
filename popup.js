document.addEventListener('DOMContentLoaded', function() {
  // Load the blocked sites list
  loadBlockedSites();
  
  // Add event listener for the add button
  document.getElementById('add-button').addEventListener('click', addSite);
  
  // Add event listener for the enter key in the input field
  document.getElementById('new-site').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addSite();
    }
  });
});

// Load blocked sites from storage and display them
function loadBlockedSites() {
  chrome.storage.sync.get('blockedSites', function(data) {
    const sitesList = document.getElementById('sites-list');
    sitesList.innerHTML = '';
    
    const sites = data.blockedSites || [];
    
    sites.forEach(function(site) {
      const li = document.createElement('li');
      li.textContent = site;
      
      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', function() {
        removeSite(site);
      });
      
      li.appendChild(removeButton);
      sitesList.appendChild(li);
    });
  });
}

// Add a new site to the blocked list
function addSite() {
  const input = document.getElementById('new-site');
  const site = input.value.trim();
  
  if (site) {
    chrome.storage.sync.get('blockedSites', function(data) {
      const sites = data.blockedSites || [];
      
      if (!sites.includes(site)) {
        sites.push(site);
        chrome.storage.sync.set({'blockedSites': sites}, function() {
          loadBlockedSites();
          input.value = '';
        });
      } else {
        alert('This site is already in your list.');
      }
    });
  }
}

// Remove a site from the blocked list
function removeSite(site) {
  chrome.storage.sync.get('blockedSites', function(data) {
    const sites = data.blockedSites || [];
    const index = sites.indexOf(site);
    
    if (index !== -1) {
      sites.splice(index, 1);
      chrome.storage.sync.set({'blockedSites': sites}, function() {
        loadBlockedSites();
      });
    }
  });
}
