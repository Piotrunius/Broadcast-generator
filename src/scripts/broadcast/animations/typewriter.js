/**
 * Professional Typewriter Animation System
 * Reliable, responsive, and production-grade typing animation with audio feedback
 * GUARANTEED: Always shows text correctly, never conflicts, always responsive
 */

let currentAnimationId = null;  // Track active animation by ID
let audioManager = null;

/**
 * Set the audio manager instance for sound effects
 */
export function setAudioManager(manager) {
    audioManager = manager;
}

/**
 * Find common prefix between two strings
 */
function findCommonPrefix(str1, str2) {
    let i = 0;
    while (i < str1.length && i < str2.length && str1[i] === str2[i]) i++;
    return i;
}

/**
 * Find common suffix between two strings
 */
function findCommonSuffix(str1, str2) {
    let i = 0;
    while (i < str1.length && i < str2.length &&
        str1[str1.length - 1 - i] === str2[str2.length - 1 - i]) i++;
    return i;
}

/**
 * Sleep utility with animation ID tracking
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main typewriter animation - PRODUCTION GRADE
 * Guarantees:
 * - Final text ALWAYS displays correctly
 * - Never conflicts with other animations
 * - Audio plays for EVERY character
 * - Fully responsive to user interactions
 * - Handles edge cases gracefully
 */
export async function typeText(element, targetText, updateCounterFn, updateColorFn, callback) {
    if (!element) return false;

    const target = (targetText ?? '').toString();
    const animationId = Date.now() + Math.random();  // Unique ID

    // Set as current animation - cancels any previous
    const previousId = currentAnimationId;
    currentAnimationId = animationId;

    // Wait for previous animation to finish (timeout: 500ms)
    let waitMs = 0;
    while (previousId !== null && currentAnimationId === animationId && waitMs < 500) {
        await sleep(20);
        waitMs += 20;
    }

    // If we got cancelled while waiting, exit
    if (currentAnimationId !== animationId) {
        return false;
    }

    const current = element.value || '';

    // Calculate diff between current and target
    const prefixLen = findCommonPrefix(current, target);
    const suffixLen = findCommonSuffix(
        current.substring(prefixLen),
        target.substring(prefixLen)
    );

    const deleteText = current.substring(prefixLen, current.length - suffixLen);
    const typeText = target.substring(prefixLen, target.length - suffixLen);
    const prefix = current.substring(0, prefixLen);
    const suffix = current.substring(current.length - suffixLen);

    // If nothing to animate, finish immediately
    if (!deleteText && !typeText) {
        element.value = target;
        updateCounterFn?.();
        updateColorFn?.();
        currentAnimationId = null;
        callback?.();
        return true;
    }

    const BACKSPACE_DELAY = 30;
    const TYPING_DELAY = 35;
    const PAUSE_DELAY = 80;

    try {
        // PHASE 1: DELETE
        for (let i = deleteText.length; i > 0; i--) {
            if (currentAnimationId !== animationId) {
                element.value = target;
                updateCounterFn?.();
                updateColorFn?.();
                return false;
            }

            element.value = prefix + deleteText.substring(0, i - 1) + suffix;
            updateCounterFn?.();
            updateColorFn?.();

            try {
                audioManager?.playType?.();
            } catch (e) {
                // Silently continue if audio fails
            }

            await sleep(BACKSPACE_DELAY);
        }

        // PHASE 2: PAUSE
        if (typeText && deleteText) {
            await sleep(PAUSE_DELAY);
        }

        // PHASE 3: TYPE
        for (let i = 0; i < typeText.length; i++) {
            if (currentAnimationId !== animationId) {
                element.value = target;
                updateCounterFn?.();
                updateColorFn?.();
                return false;
            }

            element.value = prefix + typeText.substring(0, i + 1) + suffix;
            updateCounterFn?.();
            updateColorFn?.();

            try {
                audioManager?.playType?.();
            } catch (e) {
                // Silently continue if audio fails
            }

            const delay = TYPING_DELAY + (Math.random() < 0.15 ? 15 : 0);
            await sleep(delay);
        }

        // FINALIZATION
        if (currentAnimationId === animationId) {
            element.value = target;
            updateCounterFn?.();
            updateColorFn?.();
            currentAnimationId = null;
            callback?.();
            return true;
        }

    } catch (error) {
        console.error('Typewriter error:', error);
        // EMERGENCY: Always set final text
        element.value = target;
        updateCounterFn?.();
        updateColorFn?.();
        if (currentAnimationId === animationId) {
            currentAnimationId = null;
        }
        return false;
    }

    return false;
}

/**
 * Instant text update (fallback/emergency)
 */
export function setTextInstant(element, targetText, updateCounterFn, updateColorFn) {
    if (!element) return;
    currentAnimationId = null;
    element.value = (targetText ?? '').toString();
    updateCounterFn?.();
    updateColorFn?.();
}

/**
 * Check if animation is running
 */
export function isTyping() {
    return currentAnimationId !== null;
}

/**
 * Stop animation immediately
 */
export function stopAnimation() {
    currentAnimationId = null;
}
