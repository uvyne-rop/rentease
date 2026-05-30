// API base URL - uses environment variable if provided, otherwise defaults to local backend in development
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:5000' : '')

export function getApiUrl(endpoint) {
  return `${API_URL}${endpoint}`
}

export default API_URL
