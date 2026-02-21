import { trackEvent } from '../utils/umami-tracker.js';

const FEEDBACK_WORKER_URL = 'https://webhook.piotrunius.workers.dev';
const TURNSTILE_SITE_KEY = '0x4AAAAAACY41I_bTFCmq-xo';

let captchaWidget = null;
let captchaToken = null;
let tokenPollInterval = null;

const STORAGE_KEY_ANSWERED = 'broadcast_survey_answered';
const STORAGE_KEY_CLOSED = 'broadcast_survey_closed';

function createPanel() {
    if (localStorage.getItem(STORAGE_KEY_ANSWERED) === 'true') return; // permanently hide

    const closed = localStorage.getItem(STORAGE_KEY_CLOSED) === 'true';

    const panel = document.createElement('div');
    panel.id = 'survey-panel';
    panel.innerHTML = `
        <div class="survey-top">
            <div class="survey-title">Quick Survey</div>
            <button id="survey-hide" class="survey-hide" title="Close">&times;</button>
        </div>
        <div class="survey-body">
            <p class="survey-question">Should we add <a href="https://www.roblox.com/games/5041144419/SCP-Roleplay" target="_blank" rel="noopener noreferrer">SCP: Roleplay</a> to this website?</p>
            <div class="survey-choices">
                <button id="survey-yes" class="survey-yes main-btn">Yes</button>
                <button id="survey-no" class="survey-no main-btn">No</button>
            </div>
            <div id="survey-status" aria-live="polite"></div>
            <div id="survey-captcha-container" class="hidden-captcha"></div>
        </div>
    `;

    document.body.appendChild(panel);

    // Close only for this session: remove the element but do NOT set STORAGE_KEY_CLOSED,
    // so the panel will reappear on the next page refresh.
    document.getElementById('survey-hide').addEventListener('click', () => {
        // Track that the survey was minimized without voting
        try {
            trackEvent('Survey_Minimized', { survey: 'broadcast', answered: false });
        } catch (e) {
            // ignore tracking errors
        }
        panel.remove();
    });

    document.getElementById('survey-yes').addEventListener('click', () => submitAnswer('Yes'));
    document.getElementById('survey-no').addEventListener('click', () => submitAnswer('No'));

    if (closed) {
        panel.remove();
    }

    // Render hidden Turnstile
    renderTurnstile();
}

function injectStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    try {
        // Attempt to resolve the CSS path relative to the running script.
        const scriptSrc = (document.currentScript && document.currentScript.src) || (() => {
            const scripts = document.getElementsByTagName('script');
            for (let i = scripts.length - 1; i >= 0; i--) {
                if (scripts[i].src && scripts[i].src.includes('survey')) return scripts[i].src;
            }
            return window.location.href;
        })();
        // CSS is located two levels up from /src/scripts/ui/ -> ../../styles/pages/survey.css
        link.href = new URL('../../styles/pages/survey.css', scriptSrc).href;
    } catch (e) {
        // Fallback: try repo-root relative path (works if hosted at repo root)
        const parts = window.location.pathname.split('/').filter(Boolean);
        const repo = parts.length ? '/' + parts[0] : '';
        link.href = repo + '/src/styles/pages/survey.css';
    }
    document.head.appendChild(link);
}

function openModal() {
    if (document.getElementById('survey-modal')) return;
    const overlay = document.createElement('div');
    overlay.id = 'survey-overlay';

    const modal = document.createElement('div');
    modal.id = 'survey-modal';
    modal.innerHTML = `
    <div class="survey-header">
      <h3>Quick Survey</h3>
      <button id="survey-close">×</button>
    </div>
    <form id="survey-form">
      <label>How would you rate this site?</label>
      <div id="survey-rating">
        <button type="button" data-value="1">1</button>
        <button type="button" data-value="2">2</button>
        <button type="button" data-value="3">3</button>
        <button type="button" data-value="4">4</button>
        <button type="button" data-value="5">5</button>
      </div>
      <label for="survey-message">Comments</label>
      <textarea id="survey-message" rows="4" placeholder="Optional feedback..."></textarea>
      <label for="survey-email">Email (optional)</label>
      <input id="survey-email" type="email" placeholder="you@example.com" />

      <div id="survey-captcha-container" class="hidden-captcha"></div>

      <div class="survey-actions">
        <button id="survey-submit" type="submit">Submit</button>
      </div>
      <div id="survey-status" aria-live="polite"></div>
    </form>
  `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById('survey-close').addEventListener('click', closeModal);

    // rating buttons
    const ratingEl = modal.querySelector('#survey-rating');
    ratingEl.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-value]');
        if (!btn) return;
        [...ratingEl.querySelectorAll('button')].forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    });

    modal.querySelector('#survey-form').addEventListener('submit', handleSubmit);

    // Render Turnstile (hidden)
    renderTurnstile();
}

function closeModal() {
    const overlay = document.getElementById('survey-overlay');
    if (overlay) overlay.remove();
    captchaToken = null;
    if (tokenPollInterval) clearInterval(tokenPollInterval);
}

function renderTurnstile() {
    const container = document.getElementById('survey-captcha-container');
    if (!container) return;
    if (typeof window.turnstile === 'undefined') {
        // load script
        const s = document.createElement('script');
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        s.async = true;
        s.onload = () => renderTurnstile();
        document.head.appendChild(s);
        return;
    }

    if (captchaWidget) return; // already rendered

    try {
        captchaWidget = window.turnstile.render('#survey-captcha-container', {
            sitekey: TURNSTILE_SITE_KEY,
            callback: (token) => {
                captchaToken = token;
                if (tokenPollInterval) clearInterval(tokenPollInterval);
            },
            'error-callback': () => { captchaToken = null; },
            theme: 'dark',
            size: 'compact'
        });

        // polling fallback
        let pollCount = 0;
        tokenPollInterval = setInterval(() => {
            pollCount++;
            try {
                const token = window.turnstile.getResponse(captchaWidget);
                if (token) {
                    captchaToken = token;
                    clearInterval(tokenPollInterval);
                } else if (pollCount > 30) {
                    clearInterval(tokenPollInterval);
                }
            } catch (err) {
                clearInterval(tokenPollInterval);
            }
        }, 300);
    } catch (e) {
        console.warn('Turnstile render failed', e);
    }
}

async function handleSubmit(e) {
    // kept for compatibility; prefer submitAnswer(answer)
}

async function submitAnswer(answer) {
    const status = document.getElementById('survey-status');
    if (!status) return;
    status.textContent = '';

    if (!captchaToken) {
        status.textContent = 'Waiting for captcha verification...';
        return;
    }

    // Minimal embed: only include the chosen answer (remove page/comment fields)
    const embed = {
        title: `Should we add SCP: Roleplay?`,
        color: answer === 'Yes' ? 0x34D399 : 0xF87171,
        fields: [
            { name: 'Answer', value: `${answer}`, inline: true }
        ],
        timestamp: new Date().toISOString()
    };

    const payload = { embeds: [embed], content: '' };

    try {
        const resp = await fetch(FEEDBACK_WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Origin-Verify': window.location.origin,
                'X-Captcha-Token': captchaToken || '',
                'X-Page-ID': 'survey-broadcast'
            },
            body: JSON.stringify(payload)
        });

        const json = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(json.error || 'Submission failed');

        // Track successful vote (Yes/No)
        try {
            trackEvent('Survey_Voted', { survey: 'broadcast', choice: answer });
        } catch (e) {
            // ignore tracking errors
        }

        status.textContent = 'Thanks — your response was recorded!';
        // mark answered permanently
        localStorage.setItem(STORAGE_KEY_ANSWERED, 'true');
        // remove panel/tab
        const panel = document.getElementById('survey-panel');
        if (panel) panel.remove();
        const tab = document.getElementById('survey-tab');
        if (tab) tab.remove();
    } catch (err) {
        status.textContent = `Error: ${err.message || err}`;
    }
}

// initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { injectStyles(); createPanel(); });
} else {
    injectStyles(); createPanel();
}

export { };

