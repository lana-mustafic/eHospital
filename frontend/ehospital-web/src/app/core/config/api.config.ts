export const API_CONFIG = {
  baseUrl: 'http://localhost:5039/api',
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      me: '/auth/me'
    },
    patients: '/patients',
    doctors: '/doctors',
    appointments: '/appointments',
    departments: '/departments',
    medications: '/medications',
    medicalRecords: '/medicalrecords',
    diagnoses: '/diagnoses',
    prescriptions: '/prescriptions',
    vitalSigns: '/vitalsigns',
    labTests: '/labtests',
    invoices: '/invoices',
    doctorSchedules: '/doctorschedules',
    reports: '/reports',
    audit: '/audit',
    notifications: '/notifications',
    notificationPreferences: '/notificationpreferences',
    roomTypes: '/roomtypes',
    rooms: '/rooms',
    beds: '/beds',
    admissions: '/admissions',
    roomTransfers: '/roomtransfers'
  }
};

