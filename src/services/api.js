import axios from 'axios'

const api = axios.create({
  baseURL: 'http://10.94.15.134:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json' // Wajib agar Laravel merespons dengan JSON (401), bukan redirect
  }
})

// Pasang Bearer Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api