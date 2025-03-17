let blockedSites = ["youtube.com", "x.com", "twitter.com", "bilibili.com"];

// Initialize the blocked sites list from storage, or use default if none exists
chrome.storage.sync.get('blockedSites', function(data) {
  if (data.blockedSites) {
    blockedSites = data.blockedSites;
  } else {
    // Set the default list if nothing is in storage yet
    chrome.storage.sync.set({'blockedSites': blockedSites});
  }
});

// Listen for changes to the blocked sites list
chrome.storage.onChanged.addListener(function(changes) {
  if (changes.blockedSites) {
    blockedSites = changes.blockedSites.newValue;
  }
});

// Check each navigation against the blocked sites list
chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
  // Only check main frame navigations (not iframes)
  if (details.frameId !== 0) return;
  
  const url = new URL(details.url);
  const domain = url.hostname;
  
  if (blockedSites.some(site => domain.includes(site))) {
    // Cancel the navigation
    chrome.tabs.update(details.tabId, {
      url: chrome.runtime.getURL('mindful.html') + '?destination=' + encodeURIComponent(details.url)
    });
  }
});
