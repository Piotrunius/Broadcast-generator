/**
 * Performance Mode Toggle UI Component
 * Adds a toggle button to pages for performance mode
 */

import performanceMode from './performance-mode.js';

export function createPerformanceToggle() {
    const toggle = document.createElement('div');
    toggle.className = 'performance-toggle';
    toggle.innerHTML = `
        <button class="performance-toggle-btn" title="Toggle Performance Mode (Disables animations)">
            <span class="perf-icon">⚡</span>
            <span class="perf-label">Performance Mode</span>
            <span class="perf-status">${performanceMode.isEnabled() ? 'ON' : 'OFF'}</span>
        </button>
    `;

    const button = toggle.querySelector('.performance-toggle-btn');
    const statusSpan = toggle.querySelector('.perf-status');

    // Update UI based on mode
    const updateUI = (enabled) => {
        statusSpan.textContent = enabled ? 'ON' : 'OFF';
        button.classList.toggle('active', enabled);
    };

    // Toggle on click
    button.addEventListener('click', () => {
        performanceMode.toggle();
        updateUI(performanceMode.isEnabled());
    });

    // Observe mode changes
    performanceMode.addObserver(updateUI);

    // Initial state
    updateUI(performanceMode.isEnabled());

    // Add styles
    injectToggleStyles();

    return toggle;
}

function injectToggleStyles() {
    if (document.getElementById('performance-toggle-styles')) return;

    const style = document.createElement('style');
    style.id = 'performance-toggle-styles';
    style.textContent = `
        .performance-toggle {
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 9999;
        }

        .performance-toggle-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(20, 20, 20, 0.95);
            border: 2px solid #333;
            border-radius: 8px;
            padding: 10px 16px;
            color: #888;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
        }

        .performance-toggle-btn:hover {
            border-color: #555;
            background: rgba(30, 30, 30, 0.95);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
        }

        .performance-toggle-btn.active {
            border-color: #00ff00;
            background: rgba(0, 255, 0, 0.1);
            color: #00ff00;
        }

        .performance-toggle-btn.active:hover {
            border-color: #00ff00;
            box-shadow: 0 6px 20px rgba(0, 255, 0, 0.3);
        }

        .perf-icon {
            font-size: 16px;
        }

        .perf-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .perf-status {
            background: rgba(255, 255, 255, 0.1);
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
        }

        .performance-toggle-btn.active .perf-status {
            background: rgba(0, 255, 0, 0.2);
            color: #00ff00;
        }

        /* Performance mode: disable toggle button transitions */
        body.performance-mode .performance-toggle-btn {
            transition: none !important;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
            .performance-toggle {
                bottom: 10px;
                left: 10px;
            }

            .performance-toggle-btn {
                padding: 8px 12px;
                font-size: 10px;
            }

            .perf-label {
                display: none;
            }

            .perf-icon {
                font-size: 14px;
            }
        }
    `;
    document.head.appendChild(style);
}

// Auto-add toggle to page on load
export function initPerformanceToggle() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const toggle = createPerformanceToggle();
            document.body.appendChild(toggle);
        });
    } else {
        const toggle = createPerformanceToggle();
        document.body.appendChild(toggle);
    }
}
