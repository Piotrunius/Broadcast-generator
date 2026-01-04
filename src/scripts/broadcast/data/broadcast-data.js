export const STATUS_MESSAGES = {
  LONG: {
    'SCP BREACH':
      'All personnel must initiate containment protocols immediately. Follow all emergency procedures',
    'SITE LOCKDOWN':
      'SITE LOCKDOWN! Multiple breaches detected. All armed personnel respond immediately',
    'CLASS-D ESCAPE': 'Class-D personnel have escaped containment. All staff stay alert',
    'CHAOS INSURGENCY':
      'Chaos Insurgency activity detected. All armed personnel proceed to intercept and contain threats',
    'NUCLEAR PROTOCOL':
      'All personnel must evacuate to shelters immediately. Failure to comply will result in fatality',
    CLEAR: 'All personnel resume normal duties',
    MAINTENANCE: 'Maintenance personnel report to generator room immediately',
    'O5 MEETING': 'O5 meeting scheduled',
  },
  SHORT: {
    'SCP BREACH': 'Containment protocols required',
    'SITE LOCKDOWN': 'SITE LOCKDOWN! Multiple breaches detected',
    'CLASS-D ESCAPE': 'Class-D personnel escaped',
    'CHAOS INSURGENCY': 'Chaos Insurgency activity detected',
    'NUCLEAR PROTOCOL': 'Evacuate to shelters immediately',
    CLEAR: 'Normal duties resumed',
    MAINTENANCE: 'Maintenance to generator room',
    'O5 MEETING': 'O5 meeting scheduled',
  },
  MINIMAL: {
    'SCP BREACH': '',
    'SITE LOCKDOWN': '',
    'CLASS-D ESCAPE': '',
    'CHAOS INSURGENCY': '',
    'NUCLEAR PROTOCOL': '',
    CLEAR: '',
    MAINTENANCE: '',
    'O5 MEETING': '',
  },
};

export const EVENT_MESSAGES = {
  LONG: {
    '610 EVENT':
      'SCP-610 anomaly active. Avoid exposure. Containment and quarantine teams deploy immediately',
    '076 EVENT':
      'SCP-076 containment breach. Armed response teams engage immediately with heavy gunfire',
    'CLASS-D RIOT':
      'Class-D personnel are rioting. Security teams must contain the situation immediately',
    '323 BREACH':
      'SCP-323 containment breach. All personnel evacuate immediately. Response teams engage with full-force authorization.',
  },
  SHORT: {
    '610 EVENT': 'SCP-610 anomaly active. Avoid exposure.',
    '076 EVENT': 'SCP-076 containment breach. Armed response needed.',
    'CLASS-D RIOT': 'Class-D personnel rioting. Security response.',
    '323 BREACH': 'SCP-323 containment breach. ',
  },
  MINIMAL: {
    '610 EVENT': 'SCP-610 active.',
    '076 EVENT': 'SCP-076 breach.',
    'CLASS-D RIOT': 'Class-D riot.',
    '323 BREACH': 'SCP-323 breach.',
  },
};

export const REQUIREMENT_MESSAGES = {
  ID_CHECK: {
    LONG: 'Present ID at checkpoints',
    SHORT: 'Present ID at CP',
    MINIMAL: 'ID at CP',
  },
  // Szablon dla autoryzacji SID+ (funkcja przyjmująca listę elementów)
  SID_PLUS_AUTH: {
    LONG: (items) => `SID+ Auth required for ${items.join(', ')} tests`,
    SHORT: (items) => `SID+ Auth req: ${items.join(', ')}`,
    MINIMAL: (items) => `Auth req: ${items.join(', ')}`,
  },
  // Klucze dla poszczególnych autoryzacji
  AUTH_CONX: 'CON-X',
  AUTH_SCP_008: '008',
  AUTH_SCP_409: '409',
  AUTH_SCP_701: '701',
  AUTH_SCP_035: '035',
};
