document.addEventListener('DOMContentLoaded', function() {
  const slides = document.querySelectorAll('.tooltip-slide');
  const prevButton = document.getElementById('prevTip');
  const nextButton = document.getElementById('nextTip');
  let currentSlide = 0;

  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[index].classList.add('active');
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
    console.log(`Showing next slide: ${currentSlide}`);
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
    console.log(`Showing previous slide: ${currentSlide}`);
  }

  nextButton.addEventListener('click', nextSlide);
  prevButton.addEventListener('click', prevSlide);

  showSlide(currentSlide);

  // Auto-advance slides every 5 seconds
  setInterval(function() {
    try {
      nextSlide();
    } catch (error) {
      console.error("Error auto-advancing slide: ", error.message, error.stack);
    }
  }, 5000);
});