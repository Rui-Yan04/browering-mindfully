document.addEventListener('DOMContentLoaded', function() {
  // Get the destination URL from the query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const destination = urlParams.get('destination');
  
  // Set up the continue button
  document.getElementById('continue').addEventListener('click', function() {
    if (destination) {
      window.location.href = destination;
    }
  });
  
  // Set up the back button
  document.getElementById('back').addEventListener('click', function() {
    window.history.back();
  });
});
