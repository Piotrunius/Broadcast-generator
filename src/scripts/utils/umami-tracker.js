/**
 * Umami Event Tracking Utility
 * Centralized module for tracking user interactions with Umami Analytics
 * 
 * Usage:
 *   import { trackEvent } from './umami-tracker.js';
 *   trackEvent('Button_Clicked', { page: 'home' });
 */

/**
 * Track an event with Umami
 * @param {string} eventName - Name of the event (e.g., 'Send_Button_Clicked')
 * @param {Object} [eventData] - Optional additional data to send with the event
 */
export function trackEvent(eventName, eventData = {}) {
  try {
    // Check if Umami tracking is available
    if (typeof window !== 'undefined' && window.umami && typeof window.umami.track === 'function') {
      window.umami.track(eventName, eventData);
      // Only log in development mode
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log(`[Umami] Tracked event: ${eventName}`, eventData);
      }
    } else {
      // Fallback: queue event or log warning if Umami is not yet loaded
      // Only log warnings in development
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.warn(`[Umami] Tracking not available yet for event: ${eventName}`);
      }
    }
  } catch (error) {
    console.error(`[Umami] Error tracking event '${eventName}':`, error);
  }
}

/**
 * Add Umami tracking to a DOM element
 * @param {HTMLElement} element - The element to track
 * @param {string} eventName - Name of the event to track
 * @param {Object} [eventData] - Optional additional data
 * @param {string} [eventType='click'] - The event type to listen for (default: 'click')
 */
export function addTracking(element, eventName, eventData = {}, eventType = 'click') {
  if (!element) {
    console.warn(`[Umami] Cannot add tracking: element is null for event '${eventName}'`);
    return;
  }
  
  element.addEventListener(eventType, () => {
    trackEvent(eventName, eventData);
  });
}

/**
 * Add Umami tracking to multiple elements
 * @param {string} selector - CSS selector for elements to track
 * @param {string} eventName - Name of the event to track
 * @param {Object} [eventData] - Optional additional data
 * @param {string} [eventType='click'] - The event type to listen for
 */
export function addTrackingToAll(selector, eventName, eventData = {}, eventType = 'click') {
  const elements = document.querySelectorAll(selector);
  elements.forEach((element, index) => {
    const data = { ...eventData, index };
    addTracking(element, eventName, data, eventType);
  });
}

/**
 * Track navigation events with proper timing
 * Ensures tracking completes before navigation by using a small delay
 * @param {string} targetUrl - The URL to navigate to
 * @param {string} targetPage - The page name being navigated to
 * @param {string} sourcePage - The current page name
 * @param {number} delay - Delay in ms before navigation (default: 100)
 */
export function trackAndNavigate(targetUrl, targetPage, sourcePage = '', delay = 100) {
  trackEvent('Page_Navigation', {
    target: targetPage,
    source: sourcePage || window.location.pathname
  });
  
  // Use a small delay to ensure tracking completes
  // This is a standard practice for analytics before page unload
  setTimeout(() => {
    window.location.href = targetUrl;
  }, delay);
}

/**
 * Track navigation events (page transitions)
 * @param {string} targetPage - The page being navigated to
 * @param {string} sourcePage - The current page
 */
export function trackNavigation(targetPage, sourcePage = '') {
  trackEvent('Page_Navigation', {
    target: targetPage,
    source: sourcePage || window.location.pathname
  });
}

/**
 * Track form submissions
 * @param {string} formName - Name of the form
 * @param {Object} [additionalData] - Additional form data to track
 */
export function trackFormSubmit(formName, additionalData = {}) {
  trackEvent('Form_Submit', {
    form: formName,
    ...additionalData
  });
}

/**
 * Track toggle state changes (e.g., audio, performance mode)
 * @param {string} toggleName - Name of the toggle
 * @param {boolean} newState - New state (true/false or on/off)
 */
export function trackToggle(toggleName, newState) {
  trackEvent(`${toggleName}_Toggle`, {
    state: newState ? 'on' : 'off'
  });
}
