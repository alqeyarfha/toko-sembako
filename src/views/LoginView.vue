<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

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
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = 'Gagal terhubung ke server backend!'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-100 px-4 py-10">
    <div class="w-full max-w-md rounded-[28px] border border-slate-300 bg-white p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <div class="mb-8 text-center">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-500 text-2xl text-white shadow-sm">🏪</div>
        <h2 class="mt-5 text-2xl font-semibold tracking-tight text-slate-900">Masuk ke SembakoMart</h2>
        <p class="mt-2 text-sm text-slate-600">Silakan login untuk melanjutkan belanja</p>
      </div>

      <div v-if="errorMessage" class="mb-5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Email / No. HP</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="contoh@email.com"
            class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:bg-white"
          />
        </div>

        <div>
          <label class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Kata Sandi</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:bg-white"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-xl bg-slate-500 py-3 text-sm font-semibold text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span v-if="loading">Memproses...</span>
          <span v-else>Masuk Sekarang</span>
        </button>
      </form>
    </div>
  </div>
</template>