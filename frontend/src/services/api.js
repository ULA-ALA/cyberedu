import axios from 'axios'

// v2 - https fix
const api = axios.create({
  baseURL: 'https://cyberedu-production.up.railway.app/api'
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access_token')
  if (token) {
    cfg.headers = cfg.headers || {}
    cfg.headers['Authorization'] = `Bearer ${token}`
  }
  return cfg
})

export default api