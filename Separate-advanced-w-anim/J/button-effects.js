/**
 * Advanced Button Effects - Ripple Animation
 * Adds interactive ripple effect to buttons when clicked
 */

(function() {
  'use strict';

  function createRipple(event) {
    const button = event.currentTarget;
    
    // Don't prevent default behavior - let onclick work
    // Don't stop propagation - let event bubble up
    
    // Remove any existing ripples
    const existingRipple = button.querySelector('.ripple-effect');
    if (existingRipple) {
      existingRipple.remove();
    }

    // Create ripple element
    const ripple = document.createElement('span');
    ripple.classList.add('ripple-effect');
    
    // Get click position relative to button
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    // Set ripple styles
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    button.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  // Add CSS for ripple effect
  const style = document.createElement('style');
  style.textContent = `
    .ripple-effect {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      transform: scale(0);
      animation: ripple-animation 0.6s ease-out;
      pointer-events: none;
    }
    
    @keyframes ripple-animation {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    button, .main-btn, .primary, .btn-secondary, .menu-btn {
      position: relative;
      overflow: hidden;
    }
  `;
  document.head.appendChild(style);

  // Initialize ripple effect on all buttons
  function initRippleEffects() {
    const buttons = document.querySelectorAll('button, .main-btn, .primary, .btn-secondary');
    
    buttons.forEach(button => {
      // Remove existing listeners to prevent duplicates
      button.removeEventListener('click', createRipple);
      button.addEventListener('click', createRipple);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRippleEffects);
  } else {
    initRippleEffects();
  }

  // Re-initialize when dynamic content is added
  const observer = new MutationObserver(initRippleEffects);
  observer.observe(document.body, { childList: true, subtree: true });

})();
