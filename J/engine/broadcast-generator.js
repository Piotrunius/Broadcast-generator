import { STATUS_MESSAGES, EVENT_MESSAGES, REQUIREMENT_MESSAGES } from '../data/broadcast-data.js';

export class BroadcastGenerator {
    constructor() {
        this.maxChars = 200;
    }

    generate(options) {
        const {
            status = "N/A",
            alarm = "N/A",
            testing = "N/A",
            events = [],
            breachedSCPs = [],
            requirements = {},
            customText = ""
        } = options;

        const normalizedStatus = status.toUpperCase();
        const prefix = `/broadcast Site Status: ${status} | Threat: ${alarm} | Testing: ${testing} | `;

        // --- Prepare dynamic parts with levels and priority ---
        const messageParts = [];

        // 1. Status Message
        const suppressStatusForEvents = ["076 EVENT", "610 EVENT", "323 BREACH"];
        const hasSuppressingEvent = events.some(e => suppressStatusForEvents.includes(e.toUpperCase()));
        
        let initialStatusLevel = 'MINIMAL'; // Start at minimal
        if (normalizedStatus === "SCP BREACH" && hasSuppressingEvent) {
            initialStatusLevel = 'NONE'; 
        }

        messageParts.push({
            type: 'status',
            key: normalizedStatus,
            currentLevel: initialStatusLevel,
            priority: 10,
            get_text: (lvl) => STATUS_MESSAGES[lvl]?.[normalizedStatus] || "",
            levels: ['LONG', 'SHORT', 'MINIMAL']
        });

        // 2. Event Messages
        events.forEach(eventKey => {
            const normalizedEventKey = eventKey.toUpperCase();
            messageParts.push({
                type: 'event',
                key: normalizedEventKey,
                currentLevel: 'MINIMAL', // Start at minimal
                priority: 8,
                get_text: (lvl) => EVENT_MESSAGES[lvl]?.[normalizedEventKey] || "",
                levels: ['LONG', 'SHORT', 'MINIMAL']
            });
        });

        // 3. Breached SCPs
        if (breachedSCPs.length > 0) {
            messageParts.push({
                type: 'breached_scp',
                key: 'BREACHED_SCPS_LIST',
                currentLevel: 'MINIMAL', // Start at minimal
                priority: 7,
                get_text: (lvl) => {
                    const count = breachedSCPs.length;
                    if (lvl === 'LONG') return `Breached: ${breachedSCPs.join(", ")}`;
                    if (lvl === 'SHORT') {
                        const sliced = breachedSCPs.slice(0, Math.min(count, 3));
                        return `Breached: ${sliced.join(", ")}${count > 3 ? ` (+${count - 3})` : ''}`;
                    }
                    if (lvl === 'MINIMAL') return `${count} breaches`;
                    return "";
                },
                levels: ['LONG', 'SHORT', 'MINIMAL']
            });
        }
        
        // 4. Requirements Messages
        if (requirements.idCheck) {
            messageParts.push({
                type: 'requirement',
                key: 'ID_CHECK',
                currentLevel: 'MINIMAL', // Start at minimal
                priority: 9,
                get_text: (lvl) => REQUIREMENT_MESSAGES.ID_CHECK[lvl] || "",
                levels: ['LONG', 'SHORT', 'MINIMAL']
            });
        }

        const sidPlusAuthItems = [];
        if (requirements.conX) sidPlusAuthItems.push(REQUIREMENT_MESSAGES.AUTH_CONX);
        if (requirements.scp008) sidPlusAuthItems.push(REQUIREMENT_MESSAGES.AUTH_SCP_008);
        if (requirements.scp409) sidPlusAuthItems.push(REQUIREMENT_MESSAGES.AUTH_SCP_409);
        if (requirements.scp701) sidPlusAuthItems.push(REQUIREMENT_MESSAGES.AUTH_SCP_701);
        if (requirements.scp035) sidPlusAuthItems.push(REQUIREMENT_MESSAGES.AUTH_SCP_035);

        if (sidPlusAuthItems.length > 0) {
            messageParts.push({
                type: 'requirement',
                key: 'SID_PLUS_AUTH',
                currentLevel: 'MINIMAL', // Start at minimal
                priority: 9,
                get_text: (lvl) => REQUIREMENT_MESSAGES.SID_PLUS_AUTH[lvl](sidPlusAuthItems) || "",
                levels: ['LONG', 'SHORT', 'MINIMAL']
            });
        }

        // 5. Custom Text
        if (customText && customText.trim()) {
            messageParts.push({
                type: 'custom',
                key: 'CUSTOM_TEXT',
                currentLevel: 'MINIMAL', // Start at minimal (effectively just 'LONG' or 'NONE')
                priority: 5,
                get_text: (lvl) => lvl === 'LONG' ? customText.trim() : "",
                levels: ['LONG', 'NONE']
            });
        }

        const getCurrentFullMessage = (parts) => {
            let finalOutputParts = [];
            parts.forEach(part => {
                const text = part.get_text(part.currentLevel);
                if (text) finalOutputParts.push(text);
            });
            return prefix + finalOutputParts.filter(Boolean).join(" | ");
        };
        
        // --- Phase 1: Shrink if initial MINIMAL is too long (should rarely happen) ---
        // This is a safeguard if even the most minimal version of *everything* doesn't fit.
        let currentMessage = getCurrentFullMessage(messageParts);
        let overflow = false;

        // Iteratively shrink until it fits or no more options
        while (currentMessage.length > this.maxChars) {
            let shortenedThisIteration = false;
            let bestCandidateIndex = -1;
            let lowestPriorityFound = Infinity; 
            
            for (let i = 0; i < messageParts.length; i++) {
                const part = messageParts[i];
                const currentLevelIndex = part.levels.indexOf(part.currentLevel);
                
                if (currentLevelIndex >= part.levels.length - 1) { // Already at shortest
                    continue;
                }

                const nextLowerLevel = part.levels[currentLevelIndex + 1];
                const potentialNewText = part.get_text(nextLowerLevel);
                const currentText = part.get_text(part.currentLevel);

                if (potentialNewText.length < currentText.length || (potentialNewText !== currentText && nextLowerLevel === 'MINIMAL')) {
                    if (part.priority < lowestPriorityFound) {
                        lowestPriorityFound = part.priority;
                        bestCandidateIndex = i;
                    }
                }
            }
            
            if (bestCandidateIndex !== -1) {
                const partToShorten = messageParts[bestCandidateIndex];
                const currentLevelIndex = partToShorten.levels.indexOf(partToShorten.currentLevel);
                partToShorten.currentLevel = partToShorten.levels[currentLevelIndex + 1];
                shortenedThisIteration = true;
            }

            if (!shortenedThisIteration) {
                // If even after trying to shrink everything, it still doesn't fit
                overflow = true;
                break; 
            }
            currentMessage = getCurrentFullMessage(messageParts);
        }

        // --- Phase 2: Expand if space is available ---
        // Loop while there's space, trying to expand highest priority items first
        let expandedThisIteration = true;
        while (currentMessage.length <= this.maxChars && expandedThisIteration && !overflow) {
            expandedThisIteration = false;
            let bestCandidateIndex = -1;
            let highestPriorityFound = -Infinity; 
            
            for (let i = 0; i < messageParts.length; i++) {
                const part = messageParts[i];
                const currentLevelIndex = part.levels.indexOf(part.currentLevel);
                
                if (currentLevelIndex === 0) { // Already at 'LONG' level
                    continue;
                }

                const nextHigherLevel = part.levels[currentLevelIndex - 1];
                const testParts = messageParts.map((p, idx) => ({ ...p, currentLevel: (idx === i ? nextHigherLevel : p.currentLevel) }));
                const testMessage = getCurrentFullMessage(testParts);

                if (testMessage.length <= this.maxChars) { // It fits after expansion
                    if (part.priority > highestPriorityFound) {
                        highestPriorityFound = part.priority;
                        bestCandidateIndex = i;
                    }
                }
            }
            
            if (bestCandidateIndex !== -1) {
                const partToExpand = messageParts[bestCandidateIndex];
                const currentLevelIndex = partToExpand.levels.indexOf(partToExpand.currentLevel);
                partToExpand.currentLevel = partToExpand.levels[currentLevelIndex - 1]; // Move up
                expandedThisIteration = true;
                currentMessage = getCurrentFullMessage(messageParts); // Update current message
            }
        }
        
        return { message: currentMessage, overflow: overflow };
    }
}
