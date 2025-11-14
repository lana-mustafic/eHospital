export const API_CONFIG = {
  baseUrl: 'http://localhost:3000/api', // Update this to match your backend API URL
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
    reports: '/reports'
  }
};

