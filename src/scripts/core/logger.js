// Lightweight global logger with bracketed categories and ring buffer
// Exposes window.AppLogger for non-module scripts

const MAX_BUFFER = 300;

class AppLoggerImpl {
    constructor() {
        this.buffer = [];
        // Preserve originals before wrapping
        this._orig = {
            log: console.log.bind(console),
            info: console.info ? console.info.bind(console) : console.log.bind(console),
            warn: console.warn.bind(console),
            error: console.error.bind(console),
        };
        this._installed = false;
        this.installConsoleCapture();
    }

    _timestamp() {
        try {
            return new Date().toLocaleTimeString();
        } catch {
            return '';
        }
    }

    _push(level, category, msg) {
        const ts = this._timestamp();
        const line = `[${ts}] [${level}] [${category}] ${msg}`;
        this.buffer.push(line);
        if (this.buffer.length > MAX_BUFFER) this.buffer.shift();
    }

    _formatArgs(args) {
        return args.map(a => {
            if (typeof a === 'string') return a;
            try {
                return JSON.stringify(a);
            } catch {
                return String(a);
            }
        }).join(' ');
    }

    create(category = 'APP') {
        const cat = String(category).toUpperCase();
        return {
            log: (...args) => {
                const msg = this._formatArgs(args);
                this._push('LOG', cat, msg);
                this._orig.log(`[${cat}]`, ...args);
            },
            info: (...args) => {
                const msg = this._formatArgs(args);
                this._push('INFO', cat, msg);
                this._orig.info(`[${cat}]`, ...args);
            },
            warn: (...args) => {
                const msg = this._formatArgs(args);
                this._push('WARN', cat, msg);
                this._orig.warn(`[${cat}]`, ...args);
            },
            error: (...args) => {
                const msg = this._formatArgs(args);
                this._push('ERROR', cat, msg);
                this._orig.error(`[${cat}]`, ...args);
            }
        };
    }

    getBuffer() {
        return this.buffer.slice();
    }

    clear() {
        this.buffer.length = 0;
    }

    installConsoleCapture() {
        if (this._installed) return;
        this._installed = true;
        const self = this;
        console.log = function (...args) {
            self._push('LOG', 'CONSOLE', self._formatArgs(args));
            self._orig.log.apply(console, args);
        };
        console.info = function (...args) {
            self._push('INFO', 'CONSOLE', self._formatArgs(args));
            self._orig.info.apply(console, args);
        };
        console.warn = function (...args) {
            self._push('WARN', 'CONSOLE', self._formatArgs(args));
            self._orig.warn.apply(console, args);
        };
        console.error = function (...args) {
            self._push('ERROR', 'CONSOLE', self._formatArgs(args));
            self._orig.error.apply(console, args);
        };
    }
}

export const Logger = new AppLoggerImpl();

// Make available to non-module scripts
if (typeof window !== 'undefined') {
    window.AppLogger = Logger;
}
