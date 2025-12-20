/**
 * Animation Controller - Prevents stuttering and ensures smooth animations
 */

(function () {
  'use strict';

  function initAnimations() {
    // Find all elements with animation classes
    const animatedElements = document.querySelectorAll(
      '.animate-page-enter, .animate-fade-in-up, .animate-slide-left, .animate-slide-right'
    );

    // Trigger animations immediately with small delay
    animatedElements.forEach((element, index) => {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        // Force reflow to ensure animation triggers
        void element.offsetWidth;
        // Add animating class (not needed but kept for compatibility)
        element.classList.add('animating');
      });
    });
  }

  // Wait for full load to avoid early layout thrash before styles apply
  if (document.readyState === 'complete') {
    initAnimations();
  } else {
    window.addEventListener('load', initAnimations, { once: true });
  }

  // Also trigger on page show (for back/forward navigation)
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      initAnimations();
    }
  });
})();
