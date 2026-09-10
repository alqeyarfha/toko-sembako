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
  <div class="min-h-screen bg-slate-100 text-slate-800">
    <!-- JIKA HALAMAN LOGIN: Fullscreen Bersih Tanpa Sidebar -->
    <div v-if="route.path === '/login'" class="min-h-screen">
      <router-view />
    </div>

    <!-- SEMUA HALAMAN LAINNYA (ADMIN & USER): Layout SIDEBAR Terpadu Modern -->
    <div v-else class="flex min-h-screen">
      <!-- Backdrop Mobile untuk Sidebar Drawer -->
      <div 
        v-if="isSidebarOpen" 
        @click="isSidebarOpen = false" 
        class="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
      ></div>

      <!-- SIDEBAR NAVIGASI (KIRI) -->
      <aside
        :class="[
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between bg-slate-900 text-slate-200 transition-transform duration-300 ease-in-out md:static md:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        ]"
      >
        <!-- Bagian Atas Sidebar: Logo & Navigasi -->
        <div class="flex flex-col gap-5 p-5">
          <!-- Logo & Brand Header -->
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <router-link :to="isAdmin ? '/dashboard' : '/'" class="flex items-center gap-3 group">
              <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-xl text-emerald-400 group-hover:scale-105 transition">
                🏪
              </span>
              <div>
                <h1 class="font-black text-white text-base tracking-tight leading-none">SembakoMart</h1>
                <span v-if="isAdmin" class="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Admin Panel</span>
                <span v-else class="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Toko Sembako</span>
              </div>
            </router-link>
            <button 
              @click="isSidebarOpen = false" 
              class="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
              title="Tutup Menu"
            >
              ✕
            </button>
          </div>

          <!-- Menu Navigasi Sidebar -->
          <nav class="space-y-5 text-xs">
            <!-- GROUP 1: ADMIN PANEL (Hanya Muncul jika Akun Admin) -->
            <div v-if="isAdmin" class="space-y-1.5">
              <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Menu Utama Admin</p>
              
              <!-- Dashboard -->
              <router-link
                to="/dashboard"
                :class="[
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-medium transition',
                  route.path === '/dashboard' ? 'bg-emerald-600 font-bold text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                ]"
              >
                <span class="text-base">📊</span>
                <span>Dashboard</span>
              </router-link>

              <!-- Verifikasi Transaksi -->
              <router-link
                to="/admin/transaksi"
                :class="[
                  'flex items-center justify-between rounded-xl px-3.5 py-2.5 font-medium transition',
                  route.path === '/admin/transaksi' ? 'bg-emerald-600 font-bold text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                ]"
              >
                <div class="flex items-center gap-3">
                  <span class="text-base">🧾</span>
                  <span>Verifikasi Transaksi</span>
                </div>
                <span
                  v-if="pendingCount > 0"
                  class="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white shadow-sm"
                >
                  {{ pendingCount }}
                </span>
              </router-link>

              <!-- Kelola Produk -->
              <router-link
                to="/produk"
                :class="[
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-medium transition',
                  route.path === '/produk' ? 'bg-emerald-600 font-bold text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                ]"
              >
                <span class="text-base">📦</span>
                <span>Kelola Produk</span>
              </router-link>
            </div>

            <!-- GROUP 2: BELANJA & TOKO (Tampil untuk Admin & User) -->
            <div class="space-y-1.5">
              <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {{ isAdmin ? 'Akses Toko' : 'Menu Belanja' }}
              </p>

              <!-- Katalog Toko / Beranda -->
              <router-link
                to="/"
                :class="[
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-medium transition',
                  route.path === '/' ? (isAdmin ? 'bg-slate-800 font-bold text-white' : 'bg-emerald-600 font-bold text-white shadow-sm') : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                ]"
              >
                <span class="text-base">🏪</span>
                <span>{{ isAdmin ? 'Katalog Toko Depan' : 'Katalog Sembako' }}</span>
              </router-link>

              <!-- Keranjang Belanja -->
              <router-link
                to="/keranjang"
                :class="[
                  'flex items-center justify-between rounded-xl px-3.5 py-2.5 font-medium transition',
                  route.path === '/keranjang' ? (isAdmin ? 'bg-slate-800 font-bold text-white' : 'bg-emerald-600 font-bold text-white shadow-sm') : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                ]"
              >
                <div class="flex items-center gap-3">
                  <span class="text-base">🛒</span>
                  <span>Keranjang Belanja</span>
                </div>
                <span v-if="cartCount > 0" class="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                  {{ cartCount }}
                </span>
              </router-link>

              <!-- Riwayat Transaksi -->
              <router-link
                to="/riwayat"
                :class="[
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-medium transition',
                  route.path === '/riwayat' ? (isAdmin ? 'bg-slate-800 font-bold text-white' : 'bg-emerald-600 font-bold text-white shadow-sm') : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                ]"
              >
                <span class="text-base">📜</span>
                <span>Riwayat Transaksi</span>
              </router-link>
            </div>

            <!-- GROUP 3: PENGATURAN / AKUN -->
            <div class="space-y-1.5">
              <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Akun</p>
              <router-link
                to="/profil"
                :class="[
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-medium transition',
                  route.path === '/profil' ? (isAdmin ? 'bg-slate-800 font-bold text-white' : 'bg-emerald-600 font-bold text-white shadow-sm') : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                ]"
              >
                <span class="text-base">👤</span>
                <span>{{ isAdmin ? 'Profil Admin' : 'Profil Saya' }}</span>
              </router-link>
            </div>
          </nav>
        </div>

        <!-- Bagian Bawah Sidebar: Info User & Logout -->
        <div class="border-t border-slate-800 p-4 space-y-3">
          <div class="flex items-center gap-3 rounded-xl bg-slate-800/70 p-2.5">
            <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 font-bold text-white text-xs shadow-sm">
              {{ (currentUser.name || (isAdmin ? 'A' : 'U')).charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate font-semibold text-white text-xs">
                {{ currentUser.name || (isAdmin ? 'Administrator' : 'Pelanggan Toko') }}
              </p>
              <span
                v-if="isAdmin"
                class="inline-block rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-wider"
              >
                Administrator
              </span>
              <span
                v-else
                class="inline-block rounded bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-bold text-blue-400 uppercase tracking-wider"
              >
                Pelanggan
              </span>
            </div>
          </div>

          <button
            v-if="isLoggedIn"
            @click="logout"
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 px-3 py-2.5 text-xs font-bold text-white transition shadow-sm"
          >
            <span>🚪</span>
            <span>Keluar / Logout</span>
          </button>
          <router-link
            v-else
            to="/login"
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white transition shadow-sm text-center"
          >
            <span>🔑</span>
            <span>Masuk / Login</span>
          </router-link>
        </div>
      </aside>

      <!-- KONTEN UTAMA (SISI KANAN SIDEBAR) -->
      <div class="flex flex-1 flex-col min-w-0">
        <!-- Top Header Bar -->
        <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 md:px-8 backdrop-blur-sm">
          <div class="flex items-center gap-3">
            <!-- Tombol Hamburger Mobile -->
            <button
              @click="isSidebarOpen = true"
              class="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 md:hidden"
              title="Buka Menu Sidebar"
            >
              ☰
            </button>
            <div>
              <h2 class="font-bold text-slate-800 text-sm md:text-base">
                {{ getPageTitle(route.path) }}
              </h2>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <!-- Indikator Cepat Admin: Pesanan Pending -->
            <router-link
              v-if="isAdmin && pendingCount > 0"
              to="/admin/transaksi"
              class="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition shadow-sm"
            >
              <span>⚠️</span> {{ pendingCount }} Menunggu Verifikasi
            </router-link>

            <!-- Indikator Cepat User: Keranjang Belanja -->
            <router-link
              v-if="!isAdmin"
              to="/keranjang"
              class="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm"
            >
              <span>🛒</span>
              <span class="hidden sm:inline">Keranjang</span>
              <span v-if="cartCount > 0" class="rounded-full bg-rose-500 text-white px-1.5 py-0.2 text-[10px] font-bold">
                {{ cartCount }}
              </span>
            </router-link>

            <!-- Tombol Cepat Profil -->
            <router-link
              to="/profil"
              class="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <span>👤</span>
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