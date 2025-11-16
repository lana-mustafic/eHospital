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
    reports: '/reports',
    audit: '/audit'
  }
};

