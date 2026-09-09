import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProdukView from '../views/ProdukView.vue'
import LoginView from '../views/LoginView.vue'
import DetailProdukView from '../views/DetailProdukView.vue'
import KeranjangView from '../views/KeranjangView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import RiwayatView from '../views/RiwayatView.vue'
import ProfilView from '../views/ProfilView.vue'

const routes = [

  { path: '/', name: 'home', component: HomeView },
  { path: '/produk', name: 'produk', component: ProdukView, meta: { requiresAdmin: true } },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/keranjang', name: 'keranjang', component: KeranjangView },
  { path: '/checkout', name: 'checkout', component: CheckoutView },
  { path: '/riwayat', name: 'riwayat', component: RiwayatView },
  { path: '/profil', name: 'profil', component: ProfilView },
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/produk',
    name: 'produk',
    component: ProdukView,
    meta: { requiresAdmin: true } // Menandai halaman ini hanya untuk Admin
  },
  {
    path: '/produk/:id',
    name: 'detail-produk',
    component: DetailProdukView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard
router.beforeEach((to) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // Jika halaman butuh akses admin, tapi user bukan admin
  if (to.meta.requiresAdmin && user.role !== 'admin') {
    alert('Akses ditolak! Halaman Kelola Produk hanya untuk Admin.')
    return { name: 'home' } // Lempar balik ke halaman Beranda
  }
})

export default router