document.addEventListener('DOMContentLoaded', function() {
  // Add fade-in effect to main content
  const mainContent = document.querySelector('main');
  if (mainContent) {
    mainContent.classList.add('fade-in');
  }

  // Add slide-in effect to cards
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, index) => {
    card.classList.add('slide-in');
    card.style.animationDelay = `${index * 0.1}s`;
  });

  // Add pulse effect to buttons
  const buttons = document.querySelectorAll('.btn-primary');
  buttons.forEach(button => {
    button.classList.add('pulse');
  });

  // Initialize tooltips
  const tooltips = document.querySelectorAll('[data-toggle="tooltip"]');
  tooltips.forEach(tooltip => {
    new bootstrap.Tooltip(tooltip);
  });

  // Error handling for missing elements
  window.addEventListener('error', function(event) {
    console.error("Error occurred in animations.js: ", event.message, event.error.stack);
  });
});