import { EVENT_MESSAGES, REQUIREMENT_MESSAGES, STATUS_MESSAGES } from '../data/broadcast-data.js';

export class BroadcastGenerator {
  constructor() {
    this.maxChars = 200;
    this.maxIterations = 50; // Safety limit
    
    // Event name mappings without numbers (for tagging prevention)
    this.eventNameMap = {
      '610 EVENT': {
        LONG: 'Flesh anomaly active. Avoid exposure. Containment and quarantine teams deploy immediately',
        SHORT: 'Flesh anomaly active. Avoid exposure.',
        MINIMAL: 'Flesh anomaly.',
      },
      '076 EVENT': {
        LONG: 'Abel breach. Armed response teams engage immediately with heavy gunfire',
        SHORT: 'Abel breach. Armed response needed.',
        MINIMAL: 'Abel breach.',
      },
      '323 BREACH': {
        LONG: 'Wendigo breach. All personnel evacuate immediately. Response teams engage with full-force authorization',
        SHORT: 'Wendigo breach.',
        MINIMAL: 'Wendigo breach.',
      },
    };
    
    // Requirement name mappings without numbers (for tagging prevention)
    this.requirementNameMap = {
      '008': 'Zombie pathogen',
      '409': 'Crystal virus',
      '701': 'Hanged King',
      '035': 'Possessive mask',
    };
  }

  /**
   * Count numeric sequences in text (to detect potential tagging issues)
   * Matches sequences of 2+ digits (e.g., "017", "939", "2006")
   */
  countNumbers(text) {
    // Match sequences of 2 or more digits
    const numberMatches = text.match(/\d{2,}/g);
    return numberMatches ? numberMatches.length : 0;
  }
  
  /**
   * Pre-calculate if we should use number-free format to prevent tagging
   * Returns true if the message would contain 3+ numbers with default formatting
   */
  shouldUseNumberFreeFormat(options, prefix) {
    const { events = [], breachedSCPs = [], requirements = {} } = options;
    
    // Build a test message with all default (numbered) formats
    const testParts = [];
    
    // Count numbers from events
    events.forEach(eventKey => {
      const normalizedKey = eventKey.toUpperCase();
      const eventText = EVENT_MESSAGES.LONG?.[normalizedKey] || '';
      testParts.push(eventText);
    });
    
    // Count numbers from breached SCPs
    if (breachedSCPs.length > 0) {
      testParts.push(breachedSCPs.join(', '));
    }
    
    // Count numbers from requirements
    const reqItems = [];
    if (requirements.scp008) reqItems.push('008');
    if (requirements.scp409) reqItems.push('409');
    if (requirements.scp701) reqItems.push('701');
    if (requirements.scp035) reqItems.push('035');
    if (reqItems.length > 0) {
      testParts.push(reqItems.join(', '));
    }
    
    const testMessage = prefix + testParts.join(' | ');
    const numberCount = this.countNumbers(testMessage);
    
    // Use number-free format if 3+ numbers detected
    return numberCount >= 3;
  }

  generate(options) {
    const {
      status = 'N/A',
      alarm = 'N/A',
      testing = 'N/A',
      events = [],
      breachedSCPs = [],
      requirements = {},
    } = options;

    const normalizedStatus = status.toUpperCase();
    const prefix = `/broadcast Site Status: ${status} | Threat: ${alarm} | Testing: ${testing} | `;

    // PRE-CALCULATE: Check if we need to use number-free format to prevent tagging
    const useNumberFree = this.shouldUseNumberFreeFormat(options, prefix);

    // --- Prepare dynamic parts with levels and priority ---
    const messageParts = [];

    // 1. Status Message
    const suppressStatusForEvents = ['076 EVENT', '610 EVENT', '323 BREACH'];
    const hasSuppressingEvent = events.some((e) =>
      suppressStatusForEvents.includes(e.toUpperCase())
    );

    let initialStatusLevel = 'LONG'; // Start at LONG
    if (normalizedStatus === 'SCP BREACH' && hasSuppressingEvent) {
      initialStatusLevel = 'NONE';
    }

    messageParts.push({
      type: 'status',
      key: normalizedStatus,
      currentLevel: initialStatusLevel,
      priority: 10,
      get_text: (lvl) => STATUS_MESSAGES[lvl]?.[normalizedStatus] || '',
      levels: ['LONG', 'SHORT', 'MINIMAL'],
    });

    // 2. Event Messages
    events.forEach((eventKey) => {
      const normalizedEventKey = eventKey.toUpperCase();
      const generator = this; // Reference for get_text
      
      messageParts.push({
        type: 'event',
        key: normalizedEventKey,
        currentLevel: 'LONG', // Start at LONG
        priority: 11, // Higher priority than status (was 8)
        get_text: (lvl) => {
          // If using number-free format, use pre-defined name-based descriptions
          if (useNumberFree && generator.eventNameMap[normalizedEventKey]) {
            return generator.eventNameMap[normalizedEventKey][lvl] || '';
          }
          
          // Use original format with numbers
          return EVENT_MESSAGES[lvl]?.[normalizedEventKey] || '';
        },
        levels: ['LONG', 'SHORT', 'MINIMAL'],
      });
    });

    // 3. Breached SCPs
    if (breachedSCPs.length > 0) {
      messageParts.push({
        type: 'breached_scp',
        key: 'BREACHED_SCPS_LIST',
        currentLevel: 'LONG', // Start at LONG
        priority: 7,
        get_text: (lvl) => {
          const count = breachedSCPs.length;
          
          // TAGGING PREVENTION: Use count format if number-free mode is enabled
          if (useNumberFree) {
            if (lvl === 'LONG') return `Breached: ${count} SCP${count > 1 ? 's' : ''}`;
            if (lvl === 'SHORT') return `${count} breaches`;
            if (lvl === 'MINIMAL') return `${count} breaches`;
          }
          
          // Safe to show numbers: Use original format
          if (lvl === 'LONG') return `Breached: ${breachedSCPs.join(', ')}`;
          if (lvl === 'SHORT') {
            // Shorten by stripping the 'SCP-' prefix for compact display
            const abbreviate = (names) => names.map((n) => n.replace(/^SCP-?/i, '').trim());
            const sliced = abbreviate(breachedSCPs.slice(0, Math.min(count, 3)));
            return `Breached: ${sliced.join(', ')}${count > 3 ? ` (+${count - 3})` : ''}`;
          }
          if (lvl === 'MINIMAL') return `${count} breaches`;
          return '';
        },
        levels: ['LONG', 'SHORT', 'MINIMAL'],
      });
    }

    // 4. Requirements Messages
    if (requirements.idCheck) {
      messageParts.push({
        type: 'requirement',
        key: 'ID_CHECK',
        currentLevel: 'LONG', // Start at LONG
        priority: 9,
        get_text: (lvl) => REQUIREMENT_MESSAGES.ID_CHECK[lvl] || '',
        levels: ['LONG', 'SHORT', 'MINIMAL'],
      });
    }

    const sidPlusAuthItems = [];
    if (requirements.conX) sidPlusAuthItems.push(REQUIREMENT_MESSAGES.AUTH_CONX);
    if (requirements.scp008) sidPlusAuthItems.push(REQUIREMENT_MESSAGES.AUTH_SCP_008);
    if (requirements.scp409) sidPlusAuthItems.push(REQUIREMENT_MESSAGES.AUTH_SCP_409);
    if (requirements.scp701) sidPlusAuthItems.push(REQUIREMENT_MESSAGES.AUTH_SCP_701);
    if (requirements.scp035) sidPlusAuthItems.push(REQUIREMENT_MESSAGES.AUTH_SCP_035);

    if (sidPlusAuthItems.length > 0) {
      const generator = this; // Reference for get_text
      
      messageParts.push({
        type: 'requirement',
        key: 'SID_PLUS_AUTH',
        currentLevel: 'LONG', // Start at LONG
        priority: 9,
        get_text: (lvl) => {
          // TAGGING PREVENTION: Use name-based descriptions if needed
          if (useNumberFree) {
            const nameBased = sidPlusAuthItems.map(item => {
              return generator.requirementNameMap[item] || item; // Keep non-numeric items as-is (like CON-X)
            });
            
            if (lvl === 'LONG') return `SID+ Auth required for ${nameBased.join(', ')} tests`;
            if (lvl === 'SHORT') return `SID+ Auth req: ${nameBased.join(', ')}`;
            if (lvl === 'MINIMAL') return `Auth req: ${nameBased.join(', ')}`;
          }
          
          // Use original format with numbers
          return REQUIREMENT_MESSAGES.SID_PLUS_AUTH[lvl](sidPlusAuthItems) || '';
        },
        levels: ['LONG', 'SHORT', 'MINIMAL'],
      });
    }

    const getCurrentFullMessage = (parts) => {
      let finalOutputParts = [];
      parts.forEach((part) => {
        const text = part.get_text(part.currentLevel);
        if (text) finalOutputParts.push(text);
      });
      return prefix + finalOutputParts.filter(Boolean).join(' | ');
    };

    // --- Phase 1: Shrink if initial  is too long (should rarely happen) ---
    // This is a safeguard if even the most minimal version of *everything* doesn't fit.
    let currentMessage = getCurrentFullMessage(messageParts);
    let overflow = false;
    let shrinkIterations = 0;

    // Iteratively shrink until it fits or no more options
    while (currentMessage.length > this.maxChars && shrinkIterations < this.maxIterations) {
      shrinkIterations++;
      let shortenedThisIteration = false;
      let bestCandidateIndex = -1;
      let lowestPriorityFound = Infinity;
      let bestCandidateTargetLevel = null;

      for (let i = 0; i < messageParts.length; i++) {
        const part = messageParts[i];
        const currentLevelIndex = part.levels.indexOf(part.currentLevel);

        if (currentLevelIndex >= part.levels.length - 1) {
          // Already at shortest
          continue;
        }

        // Find the next lower level that actually reduces length (or produces different text at MINIMAL)
        const currentText = part.get_text(part.currentLevel);
        let targetLevel = null;
        for (let j = currentLevelIndex + 1; j < part.levels.length; j++) {
          const lowerLevel = part.levels[j];
          const lowerText = part.get_text(lowerLevel);
          if (
            lowerText.length < currentText.length ||
            (lowerText !== currentText && lowerLevel === 'MINIMAL')
          ) {
            targetLevel = lowerLevel;
            break;
          }
        }

        if (targetLevel) {
          if (part.priority < lowestPriorityFound) {
            lowestPriorityFound = part.priority;
            bestCandidateIndex = i;
            bestCandidateTargetLevel = targetLevel;
          }
        }
      }

      if (bestCandidateIndex !== -1) {
        const partToShorten = messageParts[bestCandidateIndex];
        if (bestCandidateTargetLevel) {
          partToShorten.currentLevel = bestCandidateTargetLevel;
        } else {
          const currentLevelIndex = partToShorten.levels.indexOf(partToShorten.currentLevel);
          partToShorten.currentLevel = partToShorten.levels[currentLevelIndex + 1];
        }
        shortenedThisIteration = true;
      }

      if (!shortenedThisIteration) {
        // If even after trying to shrink everything, it still doesn't fit
        overflow = true;
        break;
      }
      currentMessage = getCurrentFullMessage(messageParts);
    }

    // If we hit iteration limit, mark as overflow
    if (shrinkIterations >= this.maxIterations) {
      overflow = true;
    }

    // --- Phase 2: Expand if space is available ---
    // Only expand if we didn't overflow and there's space
    let expandIterations = 0;
    if (!overflow) {
      currentMessage = getCurrentFullMessage(messageParts); // Ensure we have the current message

      while (expandIterations < this.maxIterations) {
        expandIterations++;
        let bestCandidateIndex = -1;
        let highestPriorityFound = -Infinity;
        let bestTestMessage = null;

        for (let i = 0; i < messageParts.length; i++) {
          const part = messageParts[i];
          const currentLevelIndex = part.levels.indexOf(part.currentLevel);

          if (currentLevelIndex === 0) {
            // Already at 'LONG' level
            continue;
          }

          const nextHigherLevel = part.levels[currentLevelIndex - 1];

          // Quick test: temporarily change level and check length
          const oldLevel = part.currentLevel;
          part.currentLevel = nextHigherLevel;
          const testMessage = getCurrentFullMessage(messageParts);
          part.currentLevel = oldLevel;

          if (testMessage.length <= this.maxChars) {
            // It fits after expansion
            if (part.priority > highestPriorityFound) {
              highestPriorityFound = part.priority;
              bestCandidateIndex = i;
              bestTestMessage = testMessage;
            }
          }
        }

        if (bestCandidateIndex !== -1) {
          const partToExpand = messageParts[bestCandidateIndex];
          const currentLevelIndex = partToExpand.levels.indexOf(partToExpand.currentLevel);
          partToExpand.currentLevel = partToExpand.levels[currentLevelIndex - 1]; // Move up
          currentMessage = bestTestMessage; // Use the pre-calculated message
        } else {
          break; // No more expansions possible
        }
      }
    }

    return { message: currentMessage, overflow: overflow };
  }
}
