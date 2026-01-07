/**
 * Advanced Feedback System v2
 * Professional feedback system with screenshots, system info, performance metrics
 * Now creates GitHub Issues (with optional screenshot upload)
 */

const FEEDBACK_TYPES = [
    { value: 'bug', label: 'Report Issues', color: 15158332 },
    { value: 'feature', label: 'Request Features', color: 3066993 },
    { value: 'suggestion', label: 'Suggestions', color: 10181046 },
    { value: 'improvement', label: 'Improvements', color: 3329330 },
    { value: 'other', label: 'Other', color: 9807270 }
];

const PAGES = [
    { value: 'home', label: 'Home' },
    { value: 'broadcast-simple', label: 'Broadcast Simple' },
    { value: 'broadcast-advanced', label: 'Broadcast Advanced' },
    { value: 'scp-914', label: 'SCP-914' },
    { value: 'credits', label: 'Credits' }
];

// Discord webhook target (requested by user)
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1458167312988246129/6xq1hrNJMnD5VR1KvyCGxUisIjnGohwB66k507sA3E0nDgBRiwaooEB6hprVTEvLxGsN';

// GitHub repository target (kept for optional future use)
const GITHUB_OWNER = 'aresysite';
const GITHUB_REPO = 'Broadcast-generator';
const GITHUB_UPLOAD_DIR = 'feedback-uploads';

function getGithubToken() {
    return localStorage.getItem('feedback_github_token') || '';
}
function setGithubToken(token) {
    if (token) localStorage.setItem('feedback_github_token', token);
}

// Use global logger buffer if available
function getLogBuffer() {
    if (window.AppLogger && typeof window.AppLogger.getBuffer === 'function') {
        return window.AppLogger.getBuffer();
    }
    return [];
}

// Get Umami session ID if available, otherwise generate own session ID
function getSessionId() {
    try {
        // Try localStorage first
        const sessionId = localStorage.getItem('umami.sessionId');
        if (sessionId) return sessionId;
    } catch { }

    try {
        // Fallback: generate and store own session ID
        let sessionId = localStorage.getItem('feedback-session-id');
        if (!sessionId) {
            // Generate UUID v4
            sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            localStorage.setItem('feedback-session-id', sessionId);
        }
        return sessionId;
    } catch {
        return null;
    }
}

function getSystemInfo() {
    const nav = navigator;
    const perf = performance;
    const timing = perf?.timing;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    const gl = (() => {
        try {
            const canvas = document.createElement('canvas');
            const glCtx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!glCtx) return {};
            const debugInfo = glCtx.getExtension('WEBGL_debug_renderer_info');
            return debugInfo ? {
                gpuVendor: glCtx.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
                gpuRenderer: glCtx.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
            } : {};
        } catch { return {}; }
    })();

    const info = {
        url: location.href,
        referrer: document.referrer || 'N/A',
        visibility: document.visibilityState,
        userAgent: nav.userAgent,
        language: nav.language,
        platform: nav.platform,
        vendor: nav.vendor,
        doNotTrack: nav.doNotTrack,
        cookiesEnabled: nav.cookieEnabled,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        colorDepth: window.screen.colorDepth,
        pixelRatio: window.devicePixelRatio,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        memory: nav.deviceMemory ? `${nav.deviceMemory}GB` : 'Unknown',
        cores: nav.hardwareConcurrency || 'Unknown',
        onLine: nav.onLine ? 'Online' : 'Offline',
        documentReadyState: document.readyState,
        pageLoadTime: timing ? Math.max(0, Math.round(timing.loadEventEnd - timing.navigationStart)) + 'ms' : 'N/A',
        perfNow: Math.round(perf.now()) + 'ms since navigation',
        network: connection ? {
            type: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData
        } : undefined,
        ...gl
    };
    return info;
}

function formatSystemInfoMarkdown(info) {
    const lines = [
        `• URL: ${info.url}`,
        `• Referrer: ${info.referrer}`,
        `• Visibility: ${info.visibility}`,
        `• Browser: ${info.userAgent}`,
        `• Platform: ${info.platform} | Vendor: ${info.vendor}`,
        `• Lang: ${info.language} | DNT: ${info.doNotTrack || 'N/A'}`,
        `• Resolution: ${info.screenResolution} (viewport: ${info.viewport}) | DPR: ${info.pixelRatio}`,
        `• ColorDepth: ${info.colorDepth}`,
        `• Memory: ${info.memory} | Cores: ${info.cores}`,
        `• Online: ${info.onLine} | Ready: ${info.documentReadyState}`,
        `• Timezone: ${info.timezone}`,
        `• Load: ${info.pageLoadTime} | Perf: ${info.perfNow}`,
        info.network ? `• Network: ${info.network.type} | ↓ ${info.network.downlink}Mb/s | rtt ${info.network.rtt}ms | saveData ${info.network.saveData}` : null,
        info.gpuVendor ? `• GPU: ${info.gpuVendor} — ${info.gpuRenderer}` : null
    ].filter(Boolean);
    return lines.join('\n');
}

function typeIconSvg(type) {
    // Simple inline SVG icons in white
    const common = 'width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
    switch (type) {
        case 'bug': return `<svg ${common}><path d="M8 9v-3a4 4 0 0 1 8 0v3"/><path d="M3 13h18"/><path d="M19 7l-3 2"/><path d="M5 7l3 2"/><rect x="8" y="9" width="8" height="10" rx="4"/></svg>`;
        case 'feature': return `<svg ${common}><path d="M12 2l2.39 7.34H22l-6.19 4.5L18.2 21 12 16.9 5.8 21l2.39-7.16L2 9.34h7.61z"/></svg>`;
        case 'suggestion': return `<svg ${common}><circle cx="12" cy="12" r="4"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M12 2v4"/><path d="M12 18v4"/></svg>`;
        case 'improvement': return `<svg ${common}><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>`;
        default: return `<svg ${common}><path d="M4 19.5V4.5a2 2 0 0 1 2-2h8l6 6v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/></svg>`;
    }
}

function fieldIconSvg(field) {
    // Icons for form fields
    const common = 'width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
    switch (field) {
        case 'title': return `<svg ${common}><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>`;
        case 'description': return `<svg ${common}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
        case 'nickname': return `<svg ${common}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
        case 'page': return `<svg ${common}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`;
        case 'priority': return `<svg ${common}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
        case 'repro': return `<svg ${common}><path d="M21.5 2v6h-6"/><path d="M3 12.5a9 9 0 0 1 15-8.5"/><path d="M2.5 22v-6h6"/><path d="M21 11.5a9 9 0 0 1-15 8.5"/></svg>`;
        case 'categories': return `<svg ${common}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`;
        case 'steps': return `<svg ${common}><path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/><circle cx="12" cy="5" r="1"/></svg>`;
        case 'expected': return `<svg ${common}><polyline points="20 6 9 17 4 12"/></svg>`;
        case 'actual': return `<svg ${common}><circle cx="12" cy="12" r="10"/><path d="M12 6v6m0 0v6"/></svg>`;
        case 'logs': return `<svg ${common}><path d="M4 7h16M4 12h16M4 17h16"/><path d="M4 3v18"/></svg>`;
        case 'system': return `<svg ${common}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M2 17h20"/></svg>`;
        default: return `<svg ${common}><path d="M6 9l6-6 6 6m0 8l-6 6-6-6"/></svg>`;
    }
}


// Safely play UI sounds if AudioManager exists with varying method names
function playAudio(kind) {
    const am = window.audioManager;
    if (!am) return;
    const map = {
        click: ['playClick', 'playClickSound'],
        hover: ['playHover', 'playHoverSound'],
        success: ['playSuccess', 'playSuccessSound'],
        error: ['playError', 'playErrorSound'],
        toggle: ['playToggle']
    };
    const candidates = map[kind] || [];
    for (const name of candidates) {
        if (typeof am[name] === 'function') {
            try { am[name](); } catch { }
            break;
        }
    }
}

function createFeedbackUI() {
    const feedbackBtn = document.createElement('button');
    feedbackBtn.id = 'feedbackBtn';
    feedbackBtn.className = 'feedback-btn';
    feedbackBtn.setAttribute('aria-label', 'Open feedback form');
    feedbackBtn.title = 'Send feedback (Ctrl+Shift+F)';
    feedbackBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
    `;

    const modal = document.createElement('div');
    modal.id = 'feedbackModal';
    modal.className = 'feedback-modal';

    modal.innerHTML = `
                <div class="feedback-modal-content">
                        <div class="feedback-modal-header">
                                <h2>Feedback System</h2>
                                <div class="feedback-header-actions">
                                    <button type="button" class="feedback-close-btn" title="Close (Esc)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                                    </button>
                                </div>
                        </div>

            <form id="feedbackForm" class="feedback-form">
                <!-- Type Selection (always visible) -->
                <div class="form-group full">
                    <div class="feedback-type-buttons">
                        ${FEEDBACK_TYPES.map(t => `
                            <button type="button" class="type-btn" data-type="${t.value}" title="${t.label}">
                                <span class="type-icon" aria-hidden="true">${typeIconSvg(t.value)}</span>
                                <span class="type-label">${t.label}</span>
                            </button>
                        `).join('')}
                    </div>
                    <input type="hidden" id="feedbackType" name="type" required>
                </div>

                <!-- Data being sent info -->
                <div id="dataInfo" class="data-info-hidden"></div>

                <!-- Form Body - Hidden by default, shown after type selection -->
                <div id="formBody" class="form-body-hidden">
                    <!-- Title -->
                    <div class="form-group full">
                        <label for="feedbackTitle">
                            <span class="form-label-icon">${fieldIconSvg('title')}</span>
                            <span>Title</span>
                        </label>
                        <input type="text" id="feedbackTitle" name="title" placeholder="Brief title..." required maxlength="100">
                        <div class="char-counter"><span id="titleCounter">0</span>/100</div>
                    </div>

                    <!-- Message -->
                    <div class="form-group full">
                        <label for="feedbackMessage">
                            <span class="form-label-icon">${fieldIconSvg('description')}</span>
                            <span>Description</span>
                        </label>
                        <textarea id="feedbackMessage" name="message" placeholder="Describe your feedback..." required maxlength="2000" rows="5"></textarea>
                        <div class="char-counter"><span id="messageCounter">0</span>/2000</div>
                    </div>

                    <!-- Metadata Row 1: Nickname, Page, Priority, Reproducibility -->
                    <div class="form-group quarter" id="nicknameGroup">
                        <label for="feedbackNickname">
                            <span class="form-label-icon">${fieldIconSvg('nickname')}</span>
                            <span>Nickname</span>
                        </label>
                        <input type="text" id="feedbackNickname" name="nickname" placeholder="Optional..." maxlength="50">
                    </div>

                    <div class="form-group quarter">
                        <label for="feedbackPage">
                            <span class="form-label-icon">${fieldIconSvg('page')}</span>
                            <span>Page</span>
                        </label>
                        <select id="feedbackPage" name="page"></select>
                    </div>

                    <div class="form-group quarter">
                        <label for="feedbackPriority">
                            <span class="form-label-icon">${fieldIconSvg('priority')}</span>
                            <span>Priority</span>
                        </label>
                        <select id="feedbackPriority" name="priority">
                            <option value="low">Low</option>
                            <option value="medium" selected>Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>

                    <!-- Reproducibility (visible for bug only) -->
                    <div class="form-group quarter field-bug-only">
                        <label for="feedbackRepro">
                            <span class="form-label-icon">${fieldIconSvg('repro')}</span>
                            <span>Repro</span>
                        </label>
                        <select id="feedbackRepro" name="repro">
                            <option value="always">Always</option>
                            <option value="often">Often</option>
                            <option value="sometimes" selected>Sometimes</option>
                            <option value="rarely">Rarely</option>
                            <option value="unable">Unable</option>
                        </select>
                    </div>

                    <!-- Categories -->
                    <div class="form-group full field-bug-feature-other-imp">
                        <label>
                            <span class="form-label-icon">${fieldIconSvg('categories')}</span>
                            <span>Categories</span>
                        </label>
                        <div class="chip-buttons">
                            ${['UI', 'UX', 'Performance', 'Audio', 'Visual', 'Data', 'Other'].map(c => `
                                <button type="button" class="chip-btn" data-cat="${c}">${c}</button>
                            `).join('')}
                        </div>
                        <input type="hidden" id="feedbackCategories" name="categories">
                    </div>

                    <!-- Steps to reproduce / Expected / Actual (visible for bug only) -->
                    <div class="form-group full field-bug-only">
                        <label for="feedbackSteps">
                            <span class="form-label-icon">${fieldIconSvg('steps')}</span>
                            <span>Steps</span>
                        </label>
                        <textarea id="feedbackSteps" name="steps" placeholder="1) ...\n2) ...\n3) ..." rows="3" maxlength="1200"></textarea>
                    </div>
                    <div class="form-group full field-bug-only">
                        <label for="feedbackExpected">
                            <span class="form-label-icon">${fieldIconSvg('expected')}</span>
                            <span>Expected</span>
                        </label>
                        <textarea id="feedbackExpected" name="expected" placeholder="What you expected to happen" rows="3" maxlength="800"></textarea>
                    </div>
                    <div class="form-group full field-bug-only">
                        <label for="feedbackActual">
                            <span class="form-label-icon">${fieldIconSvg('actual')}</span>
                            <span>Actual</span>
                        </label>
                        <textarea id="feedbackActual" name="actual" placeholder="What actually happened" rows="3" maxlength="800"></textarea>
                    </div>

                    <!-- Options removed - logs and system info sent automatically per type -->




                <!-- Buttons -->
                <div class="form-actions full">
                    <button type="button" class="feedback-submit-btn" id="feedbackSubmitBtn">
                        <span class="btn-label">Hold to Send</span>
                        <span class="hold-progress" aria-hidden="true"></span>
                    </button>
                    <button type="button" class="feedback-cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(feedbackBtn);
    document.body.appendChild(modal);

    setupFeedbackListeners();
}

function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('home')) return 'home';
    if (path.includes('broadcast') && path.includes('simple')) return 'broadcast-simple';
    if (path.includes('broadcast') && path.includes('advanced')) return 'broadcast-advanced';
    if (path.includes('scp-914')) return 'scp-914';
    if (path.includes('credits')) return 'credits';
    return 'home';
}

async function captureScreenshot() {
    try {
        if (!window.html2canvas) return null;
        const modal = document.getElementById('feedbackModal');
        const btn = document.getElementById('feedbackBtn');
        const wasOpen = modal.classList.contains('show');
        if (wasOpen) modal.classList.remove('show');
        const prevBtnVis = btn.style.visibility;
        btn.style.visibility = 'hidden';
        // Wait for fonts, freeze animations, and hide canvases for a crisp capture
        try { await document.fonts?.ready; } catch { }
        document.documentElement.classList.add('capture-freeze');
        const hiddenCanvases = [];
        document.querySelectorAll('canvas').forEach(cv => {
            hiddenCanvases.push({ el: cv, display: cv.style.display });
            cv.style.display = 'none';
        });
        // Give two frames + extra time for transitions to settle
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        await new Promise(r => setTimeout(r, 180));

        const canvas = await html2canvas(document.body, {
            allowTaint: true,
            useCORS: true,
            backgroundColor: null,
            windowWidth: document.documentElement.scrollWidth,
            windowHeight: document.documentElement.scrollHeight,
            scrollX: 0,
            scrollY: -window.scrollY,
            scale: Math.max(1, window.devicePixelRatio || 1),
            logging: false
        });

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.92));

        // Restore
        hiddenCanvases.forEach(({ el, display }) => { el.style.display = display; });
        document.documentElement.classList.remove('capture-freeze');
        if (wasOpen) modal.classList.add('show');
        btn.style.visibility = prevBtnVis || '';
        return blob || null;
    } catch (error) {
        console.error('Screenshot error:', error);
        return null;
    }
}

function updateFieldVisibility(type) {
    // Show/hide form body and fields based on feedback type
    const formBody = document.getElementById('formBody');
    const bugOnlyFields = document.querySelectorAll('.field-bug-only');
    const bugFeatureFields = document.querySelectorAll('.field-bug-feature');
    const bugFeatureOtherImpFields = document.querySelectorAll('.field-bug-feature-other-imp');

    if (type === null) {
        // Hide entire form body if no type selected
        formBody.classList.add('form-body-hidden');
        formBody.classList.remove('form-body-visible');
        return;
    }

    // Show form body when type is selected
    formBody.classList.remove('form-body-hidden');
    formBody.classList.add('form-body-visible');

    if (type === 'bug') {
        // Bug: show repro, steps, expected, actual, logs, system, categories
        bugOnlyFields.forEach(f => f.style.display = '');
        bugFeatureFields.forEach(f => f.style.display = '');
        bugFeatureOtherImpFields.forEach(f => f.style.display = '');
    } else if (type === 'feature') {
        // Feature: show system info, categories, no logs, no steps/expected/actual
        bugOnlyFields.forEach(f => f.style.display = 'none');
        bugFeatureFields.forEach(f => f.style.display = '');
        bugFeatureOtherImpFields.forEach(f => f.style.display = '');
    } else if (type === 'other') {
        // Other: only title, description, nickname - hide everything else
        bugOnlyFields.forEach(f => f.style.display = 'none');
        bugFeatureFields.forEach(f => f.style.display = 'none');
        bugFeatureOtherImpFields.forEach(f => f.style.display = 'none');
    } else {
        // suggestion, improvement: show categories but no logs/system/repro/steps
        bugOnlyFields.forEach(f => f.style.display = 'none');
        bugFeatureFields.forEach(f => f.style.display = 'none');
        bugFeatureOtherImpFields.forEach(f => f.style.display = '');
    }
}

function updateDataInfo(type) {
    const dataInfoEl = document.getElementById('dataInfo');
    let infoText = '';

    switch (type) {
        case 'bug':
            infoText = 'This report will include: Console logs + System info';
            break;
        case 'feature':
            infoText = '';
            break;
        case 'suggestion':
            infoText = 'This report will include: System info';
            break;
        case 'improvement':
            infoText = 'This report will include: Console logs';
            break;
        case 'other':
            infoText = '';
            break;
    }

    if (infoText) {
        dataInfoEl.textContent = infoText;
        dataInfoEl.classList.remove('data-info-hidden');
        dataInfoEl.classList.add('data-info-visible');
    } else {
        dataInfoEl.classList.add('data-info-hidden');
        dataInfoEl.classList.remove('data-info-visible');
    }
}

function setupFeedbackListeners() {
    const btn = document.getElementById('feedbackBtn');
    const modal = document.getElementById('feedbackModal');
    const closeBtn = modal.querySelector('.feedback-close-btn');
    const cancelBtn = modal.querySelector('.feedback-cancel-btn');
    const form = document.getElementById('feedbackForm');
    const typeInput = document.getElementById('feedbackType');
    const pageInput = document.getElementById('feedbackPage');
    const nicknameGroup = document.getElementById('nicknameGroup');
    const titleInput = document.getElementById('feedbackTitle');
    const messageInput = document.getElementById('feedbackMessage');
    const submitBtn = document.getElementById('feedbackSubmitBtn');
    const pageSelect = document.getElementById('feedbackPage');
    const catsHidden = document.getElementById('feedbackCategories');

    let holdTimer = null;
    let holdRAF = null;
    const HOLD_MS = 1200;

    // Character counters
    titleInput.addEventListener('input', () => {
        document.getElementById('titleCounter').textContent = titleInput.value.length;
    });
    messageInput.addEventListener('input', () => {
        document.getElementById('messageCounter').textContent = messageInput.value.length;
    });

    // Populate pages and set default
    const defaultPage = getCurrentPage();
    pageSelect.innerHTML = PAGES.map(p => `<option value="${p.value}">${p.label}</option>`).join('');
    pageSelect.value = defaultPage;
    pageInput.value = defaultPage; // keep hidden value used in body composition
    pageSelect.addEventListener('change', () => {
        pageInput.value = pageSelect.value;
    });

    // Type buttons
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            typeInput.value = btn.dataset.type;
            playAudio('click');
            // Update field visibility based on type
            updateFieldVisibility(btn.dataset.type);
            // Show what data will be sent
            updateDataInfo(btn.dataset.type);
        });
    });

    // Category chips
    const selectedCats = new Set();
    document.querySelectorAll('.chip-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const c = btn.dataset.cat;
            if (selectedCats.has(c)) {
                selectedCats.delete(c);
                btn.classList.remove('active');
            } else {
                selectedCats.add(c);
                btn.classList.add('active');
            }
            catsHidden.value = Array.from(selectedCats).join(',');
            playAudio('click');
        });
    });

    // No anonymous toggle or token settings anymore

    // Screenshot functionality removed

    // Open modal
    btn.addEventListener('click', () => {
        modal.classList.add('show');
        playAudio('click');
    });

    btn.addEventListener('mouseenter', () => {
        playAudio('hover');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'F') {
            e.preventDefault();
            modal.classList.toggle('show');
        }
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });

    // Close modal
    const closeModal = () => {
        modal.classList.remove('show');
        form.reset();
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        const dPage = getCurrentPage();
        pageSelect.value = dPage;
        pageInput.value = dPage;
        document.getElementById('titleCounter').textContent = '0';
        document.getElementById('messageCounter').textContent = '0';
        selectedCats.clear();
        document.querySelectorAll('.chip-btn').forEach(btn => btn.classList.remove('active'));
        // Reset field visibility
        updateFieldVisibility(null);
        // Reset submit button visuals
        const sb = document.getElementById('feedbackSubmitBtn');
        if (sb) {
            sb.disabled = false;
            sb.classList.remove('success', 'error', 'holding');
            const lbl = sb.querySelector('.btn-label');
            if (lbl) lbl.textContent = 'Hold to Send';
            const prog = sb.querySelector('.hold-progress');
            if (prog) prog.style.setProperty('--hold-progress', '0');
        }
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Press-and-hold to submit
    const startHold = () => {
        if (holdTimer) return;
        const progressEl = submitBtn.querySelector('.hold-progress');
        const start = performance.now();
        submitBtn.classList.add('holding');
        const step = (now) => {
            const elapsed = now - start;
            const pct = Math.min(1, elapsed / HOLD_MS);
            progressEl.style.setProperty('--hold-progress', String(pct));
            if (pct >= 1) {
                clearTimeout(holdTimer);
                holdTimer = null;
                cancelAnimationFrame(holdRAF);
                submitBtn.classList.remove('holding');
                progressEl.style.setProperty('--hold-progress', '0');
                submitFeedback(form);
                return;
            }
            holdRAF = requestAnimationFrame(step);
        };
        holdRAF = requestAnimationFrame(step);
        holdTimer = setTimeout(() => { }, HOLD_MS);
    };
    const cancelHold = () => {
        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }
        if (holdRAF) cancelAnimationFrame(holdRAF);
        submitBtn.classList.remove('holding');
        submitBtn.querySelector('.hold-progress').style.setProperty('--hold-progress', '0');
    };
    submitBtn.addEventListener('mousedown', startHold);
    submitBtn.addEventListener('touchstart', startHold);
    ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(ev => submitBtn.addEventListener(ev, cancelHold));
}

async function submitFeedback(form) {
    const submitBtn = document.getElementById('feedbackSubmitBtn');

    try {
        if (!form.reportValidity()) return;

        submitBtn.disabled = true;

        const formData = new FormData(form);
        const feedbackType = formData.get('type');
        const nickname = String(formData.get('nickname') || '').trim();
        const userLabel = nickname ? nickname : 'anonymous';
        const priority = formData.get('priority');

        // Determine what data to include based on feedback type
        let includeLogs = false;
        let includeSystemInfo = false;

        if (feedbackType === 'bug') {
            includeLogs = true;
            includeSystemInfo = true;
        } else if (feedbackType === 'suggestion') {
            includeSystemInfo = true;
        } else if (feedbackType === 'improvement') {
            includeLogs = true;
        } else if (feedbackType === 'other') {
            includeLogs = false;
            includeSystemInfo = false;
        }

        let description = String(formData.get('message') || '');

        const sysInfoBlock = includeSystemInfo ? formatSystemInfoMarkdown(getSystemInfo()) : '';
        const loggerBuf = getLogBuffer();
        const logsText = includeLogs && loggerBuf.length > 0 ? loggerBuf.slice(-80).join('\n') : '';
        const logsPreview = logsText ? logsText.slice(-800) : '';

        const priorityLabel = String(priority || 'medium').toUpperCase();
        const typeLabel = String(feedbackType || 'other').toUpperCase();

        const steps = String(formData.get('steps') || '').trim();
        const expected = String(formData.get('expected') || '').trim();
        const actual = String(formData.get('actual') || '').trim();
        const categories = String(formData.get('categories') || '').trim();
        const repro = String(formData.get('repro') || 'sometimes');
        const sessionId = getSessionId();

        // Build a clean description (just the user's message)
        let body = `${description}`;

        // Send to Discord webhook
        const color = (FEEDBACK_TYPES.find(t => t.value === feedbackType)?.color) || 0xff3333;
        const embed = {
            title: `${String(formData.get('title') || '').slice(0, 240)}`,
            description: description.slice(0, 2048),
            color,
            fields: [
                { name: 'Page', value: String(formData.get('page') || 'Unknown'), inline: true },
                { name: 'Priority', value: priorityLabel, inline: true },
                { name: 'User', value: userLabel, inline: true }
            ],
            timestamp: new Date().toISOString(),
            footer: { text: 'Broadcast Generator • Feedback' }
        };
        if (sessionId) embed.fields.push({ name: 'Session ID', value: sessionId, inline: true });
        if (categories) embed.fields.push({ name: 'Categories', value: categories.split(',').join(', ').slice(0, 500), inline: true });
        embed.fields.push({ name: 'Reproducibility', value: repro, inline: true });
        if (steps) embed.fields.push({ name: 'Steps', value: steps.slice(0, 1024) });
        if (expected) embed.fields.push({ name: 'Expected', value: expected.slice(0, 1024) });
        if (actual) embed.fields.push({ name: 'Actual', value: actual.slice(0, 1024) });
        if (sysInfoBlock) embed.fields.push({ name: 'System', value: '```\n' + sysInfoBlock.slice(0, 600) + '\n```' });
        if (logsPreview) embed.fields.push({ name: 'Logs', value: '```\n' + logsPreview.slice(-600) + '\n```' });

        const formDataReq = new FormData();
        const payload = { embeds: [embed], content: '' };
        formDataReq.append('payload_json', JSON.stringify(payload));

        const res = await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            body: formDataReq
        });
        if (!res.ok) throw new Error(`Discord webhook failed: ${res.status}`);

        // Visual success on the submit button (no status text)
        const labelEl = submitBtn.querySelector('.btn-label');
        const progressEl = submitBtn.querySelector('.hold-progress');
        submitBtn.classList.remove('error');
        submitBtn.classList.add('success');
        if (labelEl) labelEl.textContent = 'Sent';
        if (progressEl) progressEl.style.setProperty('--hold-progress', '0');

        setTimeout(() => {
            const cancel = document.querySelector('.feedback-cancel-btn');
            if (cancel) {
                cancel.click();
            } else {
                document.getElementById('feedbackModal').classList.remove('show');
                form.reset();
            }
        }, 1200);
    } catch (error) {
        console.error('Feedback error:', error);
        // Visual error on the submit button (yellow)
        const labelEl = submitBtn.querySelector('.btn-label');
        const progressEl = submitBtn.querySelector('.hold-progress');
        submitBtn.classList.remove('success');
        submitBtn.classList.add('error');
        if (labelEl) labelEl.textContent = 'Error';
        if (progressEl) progressEl.style.setProperty('--hold-progress', '0');
        // Revert back after a short delay so user can retry
        setTimeout(() => {
            submitBtn.classList.remove('error');
            if (labelEl) labelEl.textContent = 'Hold to Send';
        }, 2000);
    } finally {
        submitBtn.disabled = false;
    }
}

async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

async function uploadScreenshotToRepo(token, owner, repo, blob) {
    const base64 = await blobToBase64(blob);
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const path = `${GITHUB_UPLOAD_DIR}/screenshot-${ts}.png`;
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: `Add feedback screenshot ${ts}`,
            content: base64
        })
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    const data = await res.json();
    // Prefer content.download_url
    return data.content && (data.content.download_url || data.content.html_url) || '';
}

async function createGithubIssue(token, owner, repo, { title, body, labels }) {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, body, labels })
    });
    if (!res.ok) throw new Error(`Issue create failed: ${res.status}`);
    const data = await res.json();
    return data.html_url;
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        createFeedbackUI();
    });
} else {
    createFeedbackUI();
}
