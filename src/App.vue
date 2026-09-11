<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getPendingCount } from './services/transaksiService'

const router = useRouter()
const route = useRoute()

const currentUser = ref({})
const cartCount = ref(0)
const pendingCount = ref(0)
const isSidebarOpen = ref(false)

const refreshUser = () => {
  try {
    const userData = localStorage.getItem('user')
    currentUser.value = userData ? JSON.parse(userData) : {}
  } catch (e) {
    currentUser.value = {}
  }
}

const getCartUniqueCount = () => {
  try {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]')
    const uniqueIds = new Set(
      (Array.isArray(cartData) ? cartData : [])
        .map((item) => item?.product_id || item?.produk_id || item?.id)
        .filter(Boolean)
    )
    return uniqueIds.size
  } catch (e) {
    return 0
  }
}

const refreshPendingCount = async () => {
  if (isAdmin.value) {
    try {
      pendingCount.value = await getPendingCount()
    } catch (e) {
      pendingCount.value = 0
    }
  } else {
    pendingCount.value = 0
  }
}

const loadUserAndCart = () => {
  try {
    const userData = localStorage.getItem('user')
    currentUser.value = userData ? JSON.parse(userData) : {}
    cartCount.value = getCartUniqueCount()
    refreshPendingCount()
  } catch (e) {
    currentUser.value = {}
    cartCount.value = 0
  }
}

const isAdmin = computed(() => {
  const role = (currentUser.value?.role || '').toString().toLowerCase()
  const email = (currentUser.value?.email || '').toString().toLowerCase()
  return role === 'admin' || role === 'administrator' || role.includes('admin') || email.startsWith('admin@') || email.includes('admin')
})

const isLoggedIn = computed(() => {
  return Boolean(currentUser.value?.id || currentUser.value?.email || localStorage.getItem('token'))
})

const getPageTitle = (path) => {
  if (path === '/dashboard') return 'Dashboard & Ringkasan Toko'
  if (path === '/admin/transaksi') return 'Pusat Verifikasi & Manajemen Transaksi'
  if (path === '/produk') return 'Manajemen Stok Produk Sembako'
  if (path === '/') return 'Katalog Toko Sembako'
  if (path === '/keranjang') return 'Keranjang Belanja'
  if (path === '/checkout') return 'Konfirmasi Checkout'
  if (path === '/riwayat') return 'Riwayat Transaksi Belanja'
  if (path === '/profil') return 'Profil Saya'
  return 'SembakoMart'
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('cart')
  currentUser.value = {}
  router.push('/login')
}

onMounted(() => {
  loadUserAndCart()
  window.addEventListener('user-updated', loadUserAndCart)
  window.addEventListener('transaksi-updated', refreshPendingCount)
})

onUnmounted(() => {
  window.removeEventListener('user-updated', loadUserAndCart)
  window.removeEventListener('transaksi-updated', refreshPendingCount)
})

watch(() => route.path, () => {
  isSidebarOpen.value = false
  loadUserAndCart()
})
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-800 font-sans antialiased">
    <!-- JIKA HALAMAN LOGIN / REGISTER: Fullscreen -->
    <div v-if="route.path === '/login' || route.path === '/register'" class="min-h-screen">
      <router-view />
    </div>

    <!-- SEMUA HALAMAN LAINNYA: Layout Sidebar Medium-Light Gray -->
    <div v-else class="flex min-h-screen">
      <!-- Backdrop Mobile -->
      <div 
        v-if="isSidebarOpen" 
        @click="isSidebarOpen = false" 
        class="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs md:hidden transition-opacity duration-300"
      ></div>

      <!-- SIDEBAR NAVIGASI (SLATE-300 CLEAN THEME) -->
      <aside
        :class="[
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between bg-slate-300/80 text-slate-700 transition-transform duration-300 ease-in-out md:static md:translate-x-0 border-r border-slate-300',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        ]"
      >
        <!-- Bagian Atas Sidebar: Logo & Navigasi -->
        <div class="flex flex-col gap-5 p-5">
          <!-- Logo & Brand Header -->
          <div class="flex items-center justify-between border-b border-slate-400/50 pb-4">
            <router-link :to="isAdmin ? '/dashboard' : '/'" class="flex items-center gap-3 group">
              <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-800 shadow-xs border border-slate-300 group-hover:bg-slate-50 transition duration-200">
                <svg class="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 class="font-bold text-slate-900 text-base tracking-tight leading-none">SembakoMart</h1>
                <span v-if="isAdmin" class="text-[10px] font-semibold tracking-wider text-slate-600 uppercase mt-0.5 block">Admin Panel</span>
                <span v-else class="text-[10px] font-semibold tracking-wider text-slate-600 uppercase mt-0.5 block">Toko Sembako</span>
              </div>
            </router-link>
            <button 
              @click="isSidebarOpen = false" 
              class="rounded-lg p-1 text-slate-600 hover:bg-slate-400/50 hover:text-slate-900 md:hidden transition"
              title="Tutup Menu"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Menu Navigasi Sidebar -->
          <nav class="space-y-6 text-xs font-medium">
            <!-- GROUP 1: ADMIN PANEL -->
            <div v-if="isAdmin" class="space-y-1">
              <p class="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-2">Menu Utama Admin</p>
              
              <!-- Dashboard -->
              <router-link
                to="/dashboard"
                :class="[
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition duration-200',
                  route.path === '/dashboard' ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-300' : 'text-slate-700 hover:bg-slate-400/40 hover:text-slate-900'
                ]"
              >
                <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                <span>Dashboard</span>
              </router-link>

              <!-- Verifikasi Transaksi -->
              <router-link
                to="/admin/transaksi"
                :class="[
                  'flex items-center justify-between rounded-xl px-3.5 py-2.5 transition duration-200',
                  route.path === '/admin/transaksi' ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-300' : 'text-slate-700 hover:bg-slate-400/40 hover:text-slate-900'
                ]"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span>Verifikasi Transaksi</span>
                </div>
                <span
                  v-if="pendingCount > 0"
                  class="rounded-full bg-amber-400 text-slate-900 px-2 py-0.5 text-[10px] font-bold"
                >
                  {{ pendingCount }}
                </span>
              </router-link>

              <!-- Kelola Produk -->
              <router-link
                to="/produk"
                :class="[
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition duration-200',
                  route.path === '/produk' ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-300' : 'text-slate-700 hover:bg-slate-400/40 hover:text-slate-900'
                ]"
              >
                <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                <span>Kelola Produk</span>
              </router-link>
            </div>

            <!-- GROUP 2: BELANJA & TOKO -->
            <div class="space-y-1">
              <p class="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-2">
                {{ isAdmin ? 'Akses Toko' : 'Menu Belanja' }}
              </p>

              <!-- Katalog Toko / Beranda -->
              <router-link
                to="/"
                :class="[
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition duration-200',
                  route.path === '/' ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-300' : 'text-slate-700 hover:bg-slate-400/40 hover:text-slate-900'
                ]"
              >
                <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                <span>{{ isAdmin ? 'Katalog Toko Depan' : 'Katalog Sembako' }}</span>
              </router-link>

              <!-- Keranjang Belanja -->
              <router-link
                to="/keranjang"
                :class="[
                  'flex items-center justify-between rounded-xl px-3.5 py-2.5 transition duration-200',
                  route.path === '/keranjang' ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-300' : 'text-slate-700 hover:bg-slate-400/40 hover:text-slate-900'
                ]"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  <span>Keranjang Belanja</span>
                </div>
                <span v-if="cartCount > 0" class="rounded-full bg-slate-400/70 text-slate-900 px-2 py-0.5 text-[10px] font-semibold border border-slate-400">
                  {{ cartCount }}
                </span>
              </router-link>

              <!-- Riwayat Transaksi -->
              <router-link
                to="/riwayat"
                :class="[
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition duration-200',
                  route.path === '/riwayat' ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-300' : 'text-slate-700 hover:bg-slate-400/40 hover:text-slate-900'
                ]"
              >
                <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                <span>Riwayat Transaksi</span>
              </router-link>
            </div>

            <!-- GROUP 3: AKUN -->
            <div class="space-y-1">
              <p class="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-2">Akun</p>
              <router-link
                to="/profil"
                :class="[
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition duration-200',
                  route.path === '/profil' ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-300' : 'text-slate-700 hover:bg-slate-400/40 hover:text-slate-900'
                ]"
              >
                <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                <span>{{ isAdmin ? 'Profil Admin' : 'Profil Saya' }}</span>
              </router-link>
            </div>
          </nav>
        </div>

        <!-- Bagian Bawah Sidebar: Info User & Logout -->
        <div class="border-t border-slate-400/50 p-4 space-y-3">
          <div class="flex items-center gap-3 rounded-xl bg-white p-2.5 border border-slate-300 shadow-xs">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-300">
              {{ (currentUser.name || (isAdmin ? 'A' : 'U')).charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate font-semibold text-slate-900 text-xs">
                {{ currentUser.name || (isAdmin ? 'Administrator' : 'Pelanggan Toko') }}
              </p>
              <span class="inline-block text-[10px] text-slate-600">
                {{ isAdmin ? 'Administrator' : 'Pelanggan' }}
              </span>
            </div>
          </div>

          <button
            v-if="isLoggedIn"
            @click="logout"
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-400/40 text-slate-700 hover:text-slate-900 px-3 py-2 text-xs font-medium transition duration-200 border border-slate-300 shadow-xs"
          >
            <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            <span>Keluar / Logout</span>
          </button>
          <router-link
            v-else
            to="/login"
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-400/40 text-slate-700 hover:text-slate-900 px-3 py-2 text-xs font-medium transition duration-200 border border-slate-300 shadow-xs text-center"
          >
            <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
            <span>Masuk / Login</span>
          </router-link>
        </div>
      </aside>

      <!-- KONTEN UTAMA (SISI KANAN SIDEBAR) -->
      <div class="flex flex-1 flex-col min-w-0">
        <!-- Top Header Bar -->
        <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 md:px-8 backdrop-blur-md">
          <div class="flex items-center gap-3">
            <!-- Tombol Hamburger Mobile -->
            <button
              @click="isSidebarOpen = true"
              class="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 md:hidden transition"
              title="Buka Menu Sidebar"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <div>
              <h2 class="font-semibold text-slate-800 text-sm md:text-base tracking-tight">
                {{ getPageTitle(route.path) }}
              </h2>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <!-- Indikator Cepat Admin: Pesanan Pending -->
            <router-link
              v-if="isAdmin && pendingCount > 0"
              to="/admin/transaksi"
              class="hidden sm:flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 transition shadow-xs"
            >
              <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <span>{{ pendingCount }} Menunggu Verifikasi</span>
            </router-link>

            <!-- Indikator Cepat User: Keranjang Belanja -->
            <router-link
              v-if="!isAdmin"
              to="/keranjang"
              class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              <span class="hidden sm:inline">Keranjang</span>
              <span v-if="cartCount > 0" class="rounded-full bg-slate-700 text-white px-1.5 py-0.2 text-[10px] font-semibold">
                {{ cartCount }}
              </span>
            </router-link>

            <!-- Tombol Cepat Profil -->
            <router-link
              to="/profil"
              class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              <span class="hidden sm:inline">{{ currentUser.name || (isAdmin ? 'Admin' : 'Profil') }}</span>
            </router-link>
          </div>
        </header>

        <!-- Dynamic Main Content View -->
        <main class="flex-1 p-4 md:p-8">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>