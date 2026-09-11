<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const phone = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const showPassword = ref(false)
const showPasswordConfirm = ref(false)

const passwordStrength = computed(() => {
  const p = password.value
  if (!p) return 0
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
})

const strengthMeta = computed(() => {
  const map = [
    null,
    { label: 'Lemah',       color: '#ef4444' },
    { label: 'Cukup',       color: '#f97316' },
    { label: 'Kuat',        color: '#22c55e' },
    { label: 'Sangat Kuat', color: '#16a34a' },
  ]
  return map[passwordStrength.value]
})

const passwordMatch = computed(() => {
  if (!passwordConfirm.value) return null
  return password.value === passwordConfirm.value
})

const translateError = (msg) => {
  if (!msg) return 'Terjadi kesalahan.'
  const m = msg.toLowerCase()
  if (m.includes('already been taken') || m.includes('has already been taken')) return 'Email sudah terdaftar. Gunakan email lain atau langsung masuk.'
  if (m.includes('unique')) return 'Email sudah terdaftar. Silakan gunakan email lain.'
  if (m.includes('required')) return 'Semua field wajib diisi.'
  if (m.includes('min:8') || m.includes('minimum 8')) return 'Kata sandi minimal 8 karakter.'
  if (m.includes('confirmation') || m.includes('confirmed')) return 'Konfirmasi kata sandi tidak cocok.'
  if (m.includes('invalid') && m.includes('email')) return 'Format email tidak valid.'
  if (m.includes('too long') || m.includes('max:255')) return 'Input terlalu panjang.'
  if (m.includes('connection') || m.includes('network')) return 'Gagal terhubung ke server.'
  return msg
}

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!name.value.trim()) { errorMessage.value = 'Nama lengkap wajib diisi.'; return }
  if (password.value.length < 8) { errorMessage.value = 'Kata sandi minimal 8 karakter.'; return }
  if (password.value !== passwordConfirm.value) { errorMessage.value = 'Konfirmasi kata sandi tidak cocok.'; return }

  loading.value = true
  try {
    const payload = {
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
      password_confirmation: passwordConfirm.value,
    }
    if (phone.value.trim()) payload.phone = phone.value.trim()

    await api.post('/register', payload)

    successMessage.value = 'Akun berhasil dibuat! Sedang masuk otomatis...'
    try {
      const loginRes = await api.post('/login', {
        email: email.value.trim(),
        password: password.value,
      })
      const token = loginRes.data.token
      const userObj = loginRes.data.user

      if (token) localStorage.setItem('token', token)

      const finalUser = {
        ...(userObj || {}),
        email: email.value.trim(),
        name: userObj?.name || name.value.trim(),
        role: userObj?.role || 'pembeli',
      }
      localStorage.setItem('user', JSON.stringify(finalUser))
      window.dispatchEvent(new CustomEvent('user-updated'))

      successMessage.value = `Selamat datang, ${finalUser.name}! Mengalihkan...`
      setTimeout(() => router.push({ name: 'home' }), 1500)
    } catch {
      successMessage.value = 'Akun berhasil dibuat! Silakan masuk dengan akun baru Anda.'
      setTimeout(() => router.push({ name: 'login' }), 2000)
    }

  } catch (error) {
    if (error.response?.data?.errors) {
      const err = error.response.data.errors
      const rawMsg = err[Object.keys(err)[0]][0]
      errorMessage.value = translateError(rawMsg)
    } else if (error.response?.data?.message) {
      errorMessage.value = translateError(error.response.data.message)
    } else {
      errorMessage.value = 'Gagal terhubung ke server. Pastikan koneksi internet Anda aktif.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-container">
    <div class="register-card">

      <!-- Header -->
      <div class="card-header">
        <div class="logo-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
            <path d="M2 7h20"/>
          </svg>
        </div>
        <h1 class="title">Buat Akun Baru</h1>
        <p class="subtitle">Daftar untuk mulai berbelanja di SembakoMart</p>
      </div>

      <!-- Alerts -->
      <transition name="fade">
        <div v-if="errorMessage" class="alert-box alert-error">
          <svg class="alert-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>
      </transition>

      <transition name="fade">
        <div v-if="successMessage" class="alert-box alert-success">
          <svg class="alert-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>{{ successMessage }}</span>
        </div>
      </transition>

      <!-- Form -->
      <form @submit.prevent="handleRegister" class="form-content">

        <!-- Nama -->
        <div class="input-group">
          <label for="reg-name" class="label">Nama Lengkap</label>
          <div class="input-wrapper">
            <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <input id="reg-name" v-model="name" type="text" required placeholder="Nama lengkap Anda" class="input-field" autocomplete="name" />
          </div>
        </div>

        <!-- Email -->
        <div class="input-group">
          <label for="reg-email" class="label">Alamat Email</label>
          <div class="input-wrapper">
            <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            <input id="reg-email" v-model="email" type="email" required placeholder="nama@email.com" class="input-field" autocomplete="email" />
          </div>
        </div>

        <!-- Phone -->
        <div class="input-group">
          <label for="reg-phone" class="label label-with-badge">
            <span>No. Telepon</span>
            <span class="badge-optional">Opsional</span>
          </label>
          <div class="input-wrapper">
            <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
              <path d="M12 18h.01"/>
            </svg>
            <input id="reg-phone" v-model="phone" type="tel" placeholder="08xxxxxxxxxx" class="input-field" autocomplete="tel" />
          </div>
        </div>

        <!-- Password -->
        <div class="input-group">
          <label for="reg-password" class="label">Kata Sandi</label>
          <div class="input-wrapper">
            <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              id="reg-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="Minimal 8 karakter"
              class="input-field"
              autocomplete="new-password"
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

          <!-- Strength Bar -->
          <div v-if="password" class="strength-wrap">
            <div class="strength-track">
              <div
                class="strength-bar"
                :style="{
                  width: (passwordStrength / 4 * 100) + '%',
                  backgroundColor: strengthMeta?.color
                }"
              ></div>
            </div>
            <span class="strength-text" :style="{ color: strengthMeta?.color }">
              {{ strengthMeta?.label }}
            </span>
          </div>
        </div>

        <!-- Confirm Password -->
        <div class="input-group">
          <label for="reg-pw-confirm" class="label">Konfirmasi Kata Sandi</label>
          <div class="input-wrapper">
            <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
            </svg>
            <input
              id="reg-pw-confirm"
              v-model="passwordConfirm"
              :type="showPasswordConfirm ? 'text' : 'password'"
              required
              placeholder="Ulangi kata sandi"
              class="input-field"
              :class="{
                'input-ok': passwordMatch === true,
                'input-err': passwordMatch === false
              }"
              autocomplete="new-password"
            />
            <button type="button" class="toggle-password" @click="showPasswordConfirm = !showPasswordConfirm" tabindex="-1">
              <svg v-if="!showPasswordConfirm" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
          <p v-if="passwordMatch === false" class="hint-err">Kata sandi tidak cocok</p>
          <p v-if="passwordMatch === true" class="hint-ok">✓ Kata sandi cocok</p>
        </div>

        <!-- Submit Button -->
        <button type="submit" :disabled="loading || !!successMessage" class="btn-primary">
          <span v-if="loading" class="spinner"></span>
          <span>
            {{ loading ? 'Mendaftarkan Akun...' : (successMessage ? 'Mengalihkan...' : 'Buat Akun Sekarang') }}
          </span>
        </button>

      </form>

      <!-- Card Footer -->
      <div class="card-footer">
        <span>Sudah punya akun?</span>
        <router-link :to="{ name: 'login' }" class="link">Masuk di sini</router-link>
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

.register-card {
  width: 100%;
  max-width: 420px;
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
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fee2e2;
  color: #991b1b;
}

.alert-success {
  background: #f0fdf4;
  border: 1px solid #dcfce7;
  color: #166534;
}

.alert-icon {
  flex-shrink: 0;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
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

.label-with-badge {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge-optional {
  font-size: 0.7rem;
  color: #94a3b8;
  font-weight: 400;
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

.input-field.input-ok {
  border-color: #22c55e;
}

.input-field.input-err {
  border-color: #ef4444;
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

.strength-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.strength-track {
  flex: 1;
  height: 4px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.strength-text {
  font-size: 0.75rem;
  font-weight: 500;
}

.hint-ok {
  font-size: 0.75rem;
  color: #16a34a;
  margin: 0.15rem 0 0 0;
}

.hint-err {
  font-size: 0.75rem;
  color: #dc2626;
  margin: 0.15rem 0 0 0;
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