<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const currentUser = ref({})
const cartCount = ref(0)

const loadUserAndCart = () => {
  try {
    const userData = localStorage.getItem('user')
    currentUser.value = userData ? JSON.parse(userData) : {}

    const cartData = JSON.parse(localStorage.getItem('cart') || '[]')
    cartCount.value = cartData.reduce((total, item) => total + (item.qty || 1), 0)
  } catch (e) {
    currentUser.value = {}
    cartCount.value = 0
  }
}

const isAdmin = computed(() => currentUser.value?.role?.toLowerCase() === 'admin')

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('cart')
  currentUser.value = {}
  router.push('/login')
}

onMounted(() => loadUserAndCart())
watch(() => route.path, () => loadUserAndCart())
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <header v-if="route.path !== '/login'" class="bg-slate-800 text-white shadow-md sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        <!-- Logo -->
        <router-link to="/" class="text-xl font-bold flex items-center gap-2">
          <span>🏪</span> SembakoMart
        </router-link>

        <!-- Navigation Links -->
        <nav class="flex items-center gap-3 sm:gap-5">
          <router-link to="/" class="hover:text-slate-300 text-sm font-medium transition">
            Beranda
          </router-link>

          <!-- Keranjang (Ada Badge Jumlah Item) -->
          <router-link to="/keranjang" class="relative hover:text-slate-300 text-sm font-medium transition flex items-center gap-1">
            🛒 Keranjang
            <span v-if="cartCount > 0" class="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {{ cartCount }}
            </span>
          </router-link>

          <!-- Riwayat Transaksi -->
          <router-link to="/riwayat" class="hover:text-slate-300 text-sm font-medium transition">
            📜 Riwayat
          </router-link>

          <!-- Kelola Produk (Khusus Admin) -->
          <router-link 
            v-if="isAdmin" 
            to="/produk" 
            class="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition border border-slate-600"
          >
            Kelola Produk
          </router-link>

          <!-- Profil User -->
          <router-link to="/profil" class="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-3 py-1 rounded-full hover:bg-slate-950 transition">
            <span class="text-xs uppercase tracking-wider font-semibold text-slate-200">
              👤 {{ currentUser.name || 'Pengunjung' }}
            </span>
          </router-link>

          <!-- Tombol Logout -->
          <button @click="logout" class="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition">
            Logout
          </button>
        </nav>

      </div>
    </header>

    <main class="max-w-7xl mx-auto p-4">
      <router-view />
    </main>
  </div>
</template>