// API base URL - uses environment variable or relative path for local development
const API_URL = import.meta.env.VITE_API_URL || ''

export function getApiUrl(endpoint) {
  return `${API_URL}${endpoint}`
}

export default API_URL
