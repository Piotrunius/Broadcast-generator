export const STATUS_MESSAGES = {
    LONG: {
        "SCP BREACH": "All personnel must initiate containment protocols immediately. Follow all emergency procedures",
        "SITE LOCKDOWN": "SITE LOCKDOWN! Multiple breaches detected. All armed personnel respond immediately",
        "CLASS-D ESCAPE": "Class-D personnel have escaped containment. All staff stay alert",
        "CHAOS INSURGENCY": "Chaos Insurgency activity detected. All armed personnel proceed to intercept and contain threats",
        "NUCLEAR PROTOCOL": "All personnel must evacuate to shelters immediately. Failure to comply will result in fatality",
        "CLEAR": "All personnel resume normal duties",
        "MAINTENANCE": "Maintenance personnel report to generator room immediately",
        "O5 MEETING": "O5 meeting scheduled"
    },
    SHORT: {
        "SCP BREACH": "Containment protocols required",
        "SITE LOCKDOWN": "SITE LOCKDOWN! Multiple breaches detected",
        "CLASS-D ESCAPE": "Class-D personnel escaped",
        "CHAOS INSURGENCY": "Chaos Insurgency activity detected",
        "NUCLEAR PROTOCOL": "Evacuate to shelters immediately",
        "CLEAR": "Normal duties resumed",
        "MAINTENANCE": "Maintenance to generator room",
        "O5 MEETING": "O5 meeting scheduled"
    },
    MINIMAL: {
        "SCP BREACH": "", 
        "SITE LOCKDOWN": "", 
        "CLASS-D ESCAPE": "", 
        "CHAOS INSURGENCY": "", 
        "NUCLEAR PROTOCOL": "", 
        "CLEAR": "", 
        "MAINTENANCE": "", 
        "O5 MEETING": "" 
    }
};

export const EVENT_MESSAGES = {
    "610 EVENT": "SCP-610 anomaly active. Avoid exposure. Containment and quarantine teams deploy immediately",
    "076 EVENT": "SCP-076 containment breach. Armed response teams engage immediately with heavy gunfire",
    "CLASS-D RIOT": "Class-D personnel are rioting. Security teams must contain the situation immediately",
    "323 BREACH": "SCP-323 containment breach. All personnel evacuate immediately. Response teams engage with full-force authorization."
};

// Map simplified keys to full event messages if needed, or just use these keys.
// The UI uses keys like "610 Event", we will normalize to uppercase.
