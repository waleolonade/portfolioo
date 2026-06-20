// Dynamic API URL resolution depending on whether running in dev server (5173) or Apache production
export const API_BASE_URL = window.location.port === '5173'
  ? 'http://localhost:8000/api'
  : `${window.location.protocol}//${window.location.host}/portfolioo/api`;
