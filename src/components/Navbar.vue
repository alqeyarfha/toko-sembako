<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const handleLogout = () => {
  // Hapus token & user dari storage
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  
  // Redirect ke halaman login
  router.push('/login')
}
</script>

<template>
  <nav class="bg-emerald-700 text-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        
        <!-- Logo & Brand -->
        <div class="flex items-center space-x-3">
          <span class="text-2xl">🏪</span>
          <span class="font-bold text-xl tracking-wide">SembakoMart</span>
        </div>

        <!-- Menu Navigasi -->
        <div class="flex space-x-4">
          <router-link 
            to="/" 
            class="px-3 py-2 rounded-md text-sm font-medium transition"
            :class="route.path === '/' ? 'bg-emerald-900 text-white' : 'hover:bg-emerald-600'"
          >
            Beranda
          </router-link>

          <router-link 
            to="/produk" 
            class="px-3 py-2 rounded-md text-sm font-medium transition"
            :class="route.path === '/produk' ? 'bg-emerald-900 text-white' : 'hover:bg-emerald-600'"
          >
            Kelola Produk
          </router-link>
        </div>

        <!-- Tombol Logout -->
        <div>
          <button 
            @click="handleLogout" 
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition shadow"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  </nav>
</template>