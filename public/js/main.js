document.addEventListener('DOMContentLoaded', function() {
  console.log('Main script loaded');

  // Initialize tooltips
  const tooltips = document.querySelectorAll('[data-toggle="tooltip"]');
  tooltips.forEach(tooltip => {
    new bootstrap.Tooltip(tooltip);
  });

  // Error handling for missing elements
  window.addEventListener('error', function(event) {
    console.error("Error occurred in main.js: ", event.message, event.error.stack);
  });
});