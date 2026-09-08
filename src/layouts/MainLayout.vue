<script setup>
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

const handleLogout = async () => {
  try {
    await api.post('/logout')
  } catch (error) {
    console.error('Logout API Error:', error)
  } finally {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push({ name: 'login' })
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <!-- Navbar Header -->
    <header class="sticky top-0 z-50 bg-emerald-600 text-white shadow-md">
      <div class="container mx-auto flex items-center justify-between px-4 py-3 md:px-8">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🏪</span>
          <h1 class="text-xl font-bold">SembakoMart</h1>
        </div>

        <!-- Tombol Logout -->
        <button 
          @click="handleLogout"
          class="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-800 transition"
        >
          🚪 Logout
        </button>
      </div>
    </header>

    <!-- Main Dynamic View -->
    <main class="container mx-auto px-4 py-6 md:px-8">
      <RouterView />
    </main>
  </div>
</template>