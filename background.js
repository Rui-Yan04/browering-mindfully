// background.js with bypass logic for continued navigation
let blockedSites = ["youtube.com", "x.com", "twitter.com", "bilibili.com"];
// Track sites that the user has explicitly chosen to continue to
let temporaryAllowedSites = new Set();

// Initialize the blocked sites list from storage, or use default if none exists
chrome.storage.sync.get('blockedSites', function(data) {
  console.log("Initial blocked sites data:", data);
  if (data.blockedSites) {
    blockedSites = data.blockedSites;
  } else {
    // Set the default list if nothing is in storage yet
    chrome.storage.sync.set({'blockedSites': blockedSites});
  }
  console.log("Using blocked sites:", blockedSites);
});

// Listen for changes to the blocked sites list
chrome.storage.onChanged.addListener(function(changes) {
  console.log("Storage changes detected:", changes);
  if (changes.blockedSites) {
    blockedSites = changes.blockedSites.newValue;
    console.log("Updated blocked sites:", blockedSites);
  }
});

// Store the original URL temporarily when needed
let originalDestination = '';

// Check each navigation against the blocked sites list
chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
  console.log("Navigation detected:", details);
  
  // Only check main frame navigations (not iframes)
  if (details.frameId !== 0) {
    console.log("Ignoring iframe navigation");
    return;
  }
  
  const url = new URL(details.url);
  const domain = url.hostname;
  console.log("Checking domain:", domain);
  
  // First check if this URL has been temporarily allowed
  if (isTemporarilyAllowed(details.url)) {
    console.log("URL is temporarily allowed, permitting navigation:", details.url);
    return;
  }
  
  // Check if this is one of our blocked sites
  if (blockedSites.some(site => domain.includes(site))) {
    console.log("Blocked site detected:", domain);
    
    // Store the original URL in a global variable
    originalDestination = details.url;
    console.log("Stored original destination:", originalDestination);
    
    // Redirect to our mindful page with the URL as a parameter
    const mindfulUrl = chrome.runtime.getURL('mindful.html') + '?destination=' + encodeURIComponent(details.url);
    console.log("Redirecting to mindful page:", mindfulUrl);
    
    chrome.tabs.update(details.tabId, {
      url: mindfulUrl
    }, function() {
      if (chrome.runtime.lastError) {
        console.error("Error updating tab:", chrome.runtime.lastError);
      } else {
        console.log("Successfully redirected to mindful page");
      }
    });
  }
});

// Check if a URL is in our temporarily allowed list
function isTemporarilyAllowed(url) {
  return Array.from(temporaryAllowedSites).some(allowedUrl => {
    try {
      // Compare URL hostname and pathname for matching
      const urlObj = new URL(url);
      const allowedUrlObj = new URL(allowedUrl);
      
      return urlObj.hostname === allowedUrlObj.hostname && 
             urlObj.pathname.startsWith(allowedUrlObj.pathname);
    } catch (e) {
      console.error("Error comparing URLs:", e);
      return false;
    }
  });
}

// Listen for messages from our mindful page
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log("Message received:", message);
  console.log("Sender:", sender);
  
  if (message.action === "getOriginalDestination") {
    console.log("Sending original destination:", originalDestination);
    sendResponse({url: originalDestination});
  } 
  else if (message.action === "continueToSite") {
    console.log("Continue to site requested for URL:", message.url);
    
    // Add this URL to our temporarily allowed list
    temporaryAllowedSites.add(message.url);
    console.log("Added to temporarily allowed sites:", message.url);
    console.log("Current allowed sites:", temporaryAllowedSites);
    
    // Set a timeout to remove this URL from our allowed list (e.g., after 1 minute)
    setTimeout(() => {
      temporaryAllowedSites.delete(message.url);
      console.log("Removed from temporarily allowed sites:", message.url);
    }, 60000); // 60 seconds
    
    if (!sender.tab) {
      console.error("No tab information in sender");
      // Try to get the current active tab
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs.length > 0) {
          console.log("Using current active tab:", tabs[0].id);
          navigateTab(tabs[0].id, message.url, sendResponse);
        } else {
          console.error("No active tabs found");
          sendResponse({error: "No tab found to navigate"});
        }
      });
      return true; // Keep channel open for async response
    } else {
      console.log("Using sender tab ID:", sender.tab.id);
      navigateTab(sender.tab.id, message.url, sendResponse);
      return true; // Keep channel open for async response
    }
  }
});

// Helper function to navigate a tab with proper error handling
function navigateTab(tabId, url, callback) {
  console.log(`Attempting to navigate tab ${tabId} to ${url}`);
  
  chrome.tabs.update(tabId, {url: url}, function(tab) {
    if (chrome.runtime.lastError) {
      console.error("Error navigating tab:", chrome.runtime.lastError);
      callback({success: false, error: chrome.runtime.lastError.message});
    } else {
      console.log("Tab successfully navigated:", tab);
      callback({success: true, tabId: tab.id});
    }
  });
}

// Log when the extension is installed or updated
chrome.runtime.onInstalled.addListener(function() {
  console.log("Mindful Browsing extension installed or updated");
});