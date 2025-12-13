import { STATUS_MESSAGES, EVENT_MESSAGES } from '../data/broadcast-data.js';

export class BroadcastGenerator {
    constructor() {
        this.maxChars = 200;
    }

    /**
     * Generates the broadcast string based on provided options.
     * @param {Object} options
     * @param {string} options.status - Status (e.g., "SCP BREACH")
     * @param {string} options.alarm - Alarm Level (e.g., "HIGH", "LOW")
     * @param {string} options.testing - Testing Status (e.g., "ALLOWED", "PROHIBITED")
     * @param {string[]} options.events - List of active events (e.g., ["610 EVENT"])
     * @param {string[]} options.breachedSCPs - List of breached SCPs
     * @param {Object} options.requirements - Auth requirements flags
     * @param {string} options.customText - Custom additional text
     * @returns {string} The formatted broadcast string.
     */
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
        
        // 1. Build the Prefix
        const prefix = `/broadcast Site Status: ${status} | Threat: ${alarm} | Testing: ${testing} | `;
        
        // 2. Build the Content Parts (Events, Breaches, Requirements, Custom)
        // These are "must haves" generally, or high priority.
        
        const contentParts = [];

        // Events
        // Logic from simple generator: Priority of Events over Status?
        // If we have specific combinations, we might suppress the status message later, 
        // but we always list the events here.
        const eventTexts = events.map(e => EVENT_MESSAGES[e.toUpperCase()] || e);
        if (eventTexts.length > 0) contentParts.push(eventTexts.join(" | "));

        // Breached SCPs
        if (breachedSCPs.length > 0) {
            contentParts.push(`Breached: ${breachedSCPs.join(", ")}`);
        }

        // Requirements
        const reqStrings = this._buildRequirements(requirements);
        reqStrings.forEach(r => contentParts.push(r));

        // Custom Text
        if (customText && customText.trim()) {
            contentParts.push(customText.trim());
        }

        const contentString = contentParts.join(" | ");

        // 3. Determine Status Message Strategy
        // We have LONG, SHORT, and MINIMAL.
        
        // Calculate lengths
        const longStatus = STATUS_MESSAGES.LONG[normalizedStatus] || "";
        const shortStatus = STATUS_MESSAGES.SHORT[normalizedStatus] || longStatus;
        const minimalStatus = STATUS_MESSAGES.MINIMAL[normalizedStatus] || "";

        const currentTotalLength = prefix.length + contentString.length;
        
        let selectedStatusMessage = longStatus;

        // Strategy 1: Fit Long Status
        if (currentTotalLength + (longStatus ? longStatus.length + 3 : 0) > this.maxChars) {
             // Strategy 2: Fit Short Status
             if (currentTotalLength + (shortStatus ? shortStatus.length + 3 : 0) <= this.maxChars) {
                 selectedStatusMessage = shortStatus;
             } else {
                 // Strategy 3: Minimal (or empty) Status
                 selectedStatusMessage = minimalStatus;
             }
        }
        
        // Special logic: If specific events are active, maybe suppress status message?
        // (From simple generator logic: "SCP BREACH + 076/610/323" -> only event message)
        const suppressStatusForEvents = ["076 EVENT", "610 EVENT", "323 BREACH"];
        const hasSuppressingEvent = events.some(e => suppressStatusForEvents.includes(e.toUpperCase()));
        
        if (normalizedStatus === "SCP BREACH" && hasSuppressingEvent) {
            selectedStatusMessage = ""; 
        }

        // 4. Final Assembly
        let finalParts = [];
        if (selectedStatusMessage) finalParts.push(selectedStatusMessage);
        finalParts = finalParts.concat(contentParts);
        
        let finalString = prefix + finalParts.join(" | ");

        // 5. Emergency Truncation (if still too long)
        if (finalString.length > this.maxChars) {
            // Try removing status message entirely if not already
            if (selectedStatusMessage && selectedStatusMessage !== minimalStatus) {
                finalParts[0] = minimalStatus; // Replace first part (status)
                finalString = prefix + finalParts.filter(p => p).join(" | ");
            }
            
            if (finalString.length > this.maxChars) {
                 // Try abbreviating requirements
                 finalParts = finalParts.map(part => {
                     if (part.includes("SID+ Auth required for")) {
                         return part.replace("SID+ Auth required for", "SID+ Auth req:");
                     }
                     if (part.includes("Present ID at")) {
                         return "Auth req at CP";
                     }
                     return part;
                 });
                 finalString = prefix + finalParts.filter(p => p).join(" | ");
            }

            if (finalString.length > this.maxChars && breachedSCPs.length > 0) {
                // Truncate breached SCPs
                 const breachPartIndex = finalParts.findIndex(p => p.startsWith("Breached:"));
                 if (breachPartIndex !== -1) {
                     // Simply cut it down step by step? Or just remove it? 
                     // Let's try to remove items from the list.
                     // For now, simpler approach: just leave it. The user sees the error.
                 }
            }
        }

        return finalString;
    }

    _buildRequirements(reqs) {
        const list = [];
        if (reqs.idCheck) list.push("Present ID at checkpoints");

        const scpAuths = [];
        if (reqs.conX) scpAuths.push("CON-X");
        if (reqs.scp008) scpAuths.push("008");
        if (reqs.scp409) scpAuths.push("409");
        if (reqs.scp701) scpAuths.push("701");
        if (reqs.scp035) scpAuths.push("035");

        if (scpAuths.length > 0) {
            list.push(`SID+ Auth required for ${scpAuths.join(", ")} tests`);
        }
        return list;
    }
}
