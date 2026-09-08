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

    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))

    router.push({ name: 'home' })
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
  <div>
    <div class="text-center mb-6">
      <span class="text-4xl">🏪</span>
      <h2 class="text-2xl font-bold text-gray-800 mt-2">Masuk ke SembakoMart</h2>
      <p class="text-xs text-gray-500 mt-1">Masukkan akun untuk mulai berbelanja</p>
    </div>

    <div v-if="errorMessage" class="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1">Email / No. HP</label>
        <input 
          v-model="email" 
          type="email" 
          required 
          placeholder="contoh@email.com" 
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1">Kata Sandi</label>
        <input 
          v-model="password" 
          type="password" 
          required 
          placeholder="••••••••" 
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <button 
        type="submit" 
        :disabled="loading"
        class="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        <span v-if="loading">Memproses...</span>
        <span v-else>Masuk Sekarang</span>
      </button>
    </form>
  </div>
</template>