// Dynamic API URL resolution depending on whether running in dev server or Apache production
export const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost/portfolioo/api'
  : `${window.location.protocol}//${window.location.host}/portfolioo/api`;

