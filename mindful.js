document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM fully loaded, adding event listeners");
  
  // Get the destination URL from the query parameter
  function getDestinationUrl() {
    const params = new URLSearchParams(window.location.search);
    const dest = params.get('destination');
    console.log("Destination URL from params:", dest);
    return dest;
  }
  
  // Find the continue button
  const continueButton = document.getElementById('continue');
  if (!continueButton) {
    console.error("Continue button not found in the DOM!");
  } else {
    console.log("Continue button found, adding click listener");
    
    // Continue button
    continueButton.addEventListener('click', function(event) {
      console.log("Continue button clicked");
      // Prevent any default actions
      event.preventDefault();
      
      const destination = getDestinationUrl();
      if (destination) {
        console.log('Attempting to navigate to:', destination);
        
        try {
          // Use the existing continueToSite message with error handling
          chrome.runtime.sendMessage(
            { action: "continueToSite", url: destination },
            function(response) {
              console.log("Response from background:", response);
              if (chrome.runtime.lastError) {
                console.error("Chrome runtime error:", chrome.runtime.lastError);
              }
            }
          );
        } catch (error) {
          console.error("Error sending message:", error);
        }
      } else {
        console.error("No destination found in URL parameters");
        alert("No destination found. Going back to previous page.");
        window.history.back();
      }
    });
  }
  
  // Back button
  const backButton = document.getElementById('back');
  if (!backButton) {
    console.error("Back button not found in the DOM!");
  } else {
    console.log("Back button found, adding click listener");
    
    backButton.addEventListener('click', function() {
      console.log("Back button clicked");
      window.history.back();
    });
  }
  
  // Try an alternative method to expose the chrome runtime
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    console.error("Chrome runtime not available. This might be running in a context without extension access.");
  } else {
    console.log("Chrome runtime is available");
  }
});

// Add an unload listener to catch if the page is navigating away unexpectedly
window.addEventListener('beforeunload', function(event) {
  console.log("Page is about to unload");
});

document.addEventListener("DOMContentLoaded", function () {
  const continueButton = document.getElementById("continue");
  let countdown = 30;

  // Disable button initially
  continueButton.disabled = true;
  continueButton.innerText = `Wait ${countdown}s`;

  // Countdown function
  const timer = setInterval(function () {
    countdown--;
    continueButton.innerText = countdown > 0 ? `Wait ${countdown}s` : "Yes, I want to continue";

    if (countdown <= 0) {
      clearInterval(timer);
      continueButton.disabled = false;
    }
  }, 1000);
});
