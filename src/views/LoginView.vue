<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

const translateLoginError = (msg) => {
  if (!msg) return 'Terjadi kesalahan.'
  const m = msg.toLowerCase()
  if (m.includes('user tidak ditemukan') || m.includes('not found')) return 'Email tidak terdaftar. Periksa kembali email Anda.'
  if (m.includes('password salah') || m.includes('password wrong') || m.includes('invalid credentials') || m.includes('kredensial')) return 'Kata sandi salah. Coba lagi.'
  if (m.includes('unauthenticated') || m.includes('unauthorized')) return 'Sesi tidak valid. Silakan login kembali.'
  if (m.includes('too many')) return 'Terlalu banyak percobaan. Tunggu beberapa saat.'
  return msg
}

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await api.post('/login', {
      email: email.value,
      password: password.value
    })

    const token = response.data.token
    if (token) {
      localStorage.setItem('token', token)
    }

    let userObj = response.data.user
    if (!userObj && token) {
      try {
        const profRes = await api.get('/profile')
        userObj = profRes.data?.data || profRes.data
      } catch (e) {
        // Abaikan jika endpoint profile belum siap
      }
    }

    const emailLower = (email.value || '').toLowerCase()
    const isAdminUser = emailLower.includes('admin') || userObj?.role === 'admin' || userObj?.role === 'administrator'

    const finalUser = {
      ...(userObj || {}),
      email: email.value,
      name: userObj?.name || (isAdminUser ? 'Admin Toko Sembako' : email.value.split('@')[0]),
      role: isAdminUser ? 'admin' : (userObj?.role || 'user')
    }

    localStorage.setItem('user', JSON.stringify(finalUser))
    window.dispatchEvent(new CustomEvent('user-updated'))

    if (isAdminUser) {
      router.push('/dashboard')
    } else {
      router.push({ name: 'home' })
    }
  } catch (error) {
    if (error.response && error.response.data.message) {
      errorMessage.value = translateLoginError(error.response.data.message)
    } else if (error.response?.data?.errors) {
      const err = error.response.data.errors
      errorMessage.value = err[Object.keys(err)[0]][0]
    } else {
      errorMessage.value = 'Gagal terhubung ke server backend!'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-container">
    <div class="login-card">
      
      <!-- Card Header -->
      <div class="card-header">
        <div class="logo-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
            <path d="M2 7h20"/>
          </svg>
        </div>
        <h1 class="title">Masuk ke SembakoMart</h1>
        <p class="subtitle">Belanja kebutuhan harian dengan mudah dan hemat</p>
      </div>

      <!-- Alert -->
      <transition name="fade">
        <div v-if="errorMessage" class="alert-box">
          <svg class="alert-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>
      </transition>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="form-content">
        
        <div class="input-group">
          <label for="login-email" class="label">Email / No. HP</label>
          <div class="input-wrapper">
            <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            <input
              id="login-email"
              v-model="email"
              type="email"
              required
              placeholder="nama@email.com"
              class="input-field"
              autocomplete="email"
            />
          </div>
        </div>

        <div class="input-group">
          <label for="login-password" class="label">Kata Sandi</label>
          <div class="input-wrapper">
            <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              id="login-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="••••••••"
              class="input-field"
              autocomplete="current-password"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword" tabindex="-1">
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                <line x1="2" y1="2" x2="22" y2="22"/>
              </svg>
            </button>
          </div>
        </div>

        <button type="submit" :disabled="loading" class="btn-primary">
          <span v-if="loading" class="spinner"></span>
          <span>{{ loading ? 'Memproses...' : 'Masuk' }}</span>
        </button>

      </form>

      <!-- Card Footer -->
      <div class="card-footer">
        <span>Belum punya akun?</span>
        <router-link :to="{ name: 'register' }" class="link">Daftar sekarang</router-link>
      </div>

    </div>
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  padding: 1.5rem;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 2.5rem 2rem;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-box {
  width: 48px;
  height: 48px;
  background: #f1f5f9;
  color: #0f172a;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.01em;
}

.subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.alert-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  color: #991b1b;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}

.alert-icon {
  flex-shrink: 0;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #334155;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 0.875rem;
  color: #94a3b8;
  pointer-events: none;
}

.input-field {
  width: 100%;
  padding: 0.625rem 0.875rem 0.625rem 2.5rem;
  font-size: 0.875rem;
  color: #0f172a;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  transition: all 0.15s ease-in-out;
}

.input-field::placeholder {
  color: #94a3b8;
}

.input-field:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease;
}

.toggle-password:hover {
  color: #475569;
}

.btn-primary {
  width: 100%;
  height: 42px;
  background-color: #0f172a;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.15s ease;
  margin-top: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1e293b;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.card-footer {
  text-align: center;
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 1.75rem;
  display: flex;
  justify-content: center;
  gap: 0.35rem;
}

.link {
  color: #2563eb;
  font-weight: 500;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>