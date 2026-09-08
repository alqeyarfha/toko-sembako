<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const categories = ref(['Semua', 'Beras', 'Minyak', 'Gula & Garam', 'Bumbu'])
const selectedCategory = ref('Semua')

const products = ref([])
const loading = ref(true)
const errorMessage = ref('')
const cartCount = ref(0)

const fetchProducts = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get('/products')
    products.value = response.data.data || response.data
  } catch (error) {
    console.error('Gagal mengambil data produk:', error)
    errorMessage.value = 'Gagal memuat data dari server database.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProducts()
})

const addToCart = (product) => {
  cartCount.value++
  alert(`${product.nama} berhasil ditambahkan ke keranjang!`)
}
</script>

<template>
  <div>
    <!-- Banner Promo -->
    <section class="mb-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-700 p-6 text-white shadow-lg">
      <span class="rounded-full bg-emerald-800/50 px-3 py-1 text-xs font-semibold uppercase">Promo Sembako</span>
      <h2 class="mt-2 text-2xl font-extrabold sm:text-3xl">Belanja Sembako Murah & Lengkap</h2>
      <p class="mt-1 text-sm text-emerald-100">Kebutuhan dapur harian langsung dari toko terdekat.</p>
    </section>

    <!-- Kategori Filter -->
    <section class="mb-6">
      <h3 class="mb-3 text-lg font-bold text-gray-700">Kategori</h3>
      <div class="flex gap-2 overflow-x-auto pb-2">
        <button 
          v-for="cat in categories" 
          :key="cat"
          @click="selectedCategory = cat"
          :class="[
            'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition',
            selectedCategory === cat ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'
          ]"
        >
          {{ cat }}
        </button>
      </div>
    </section>

    <!-- Section Produk -->
    <section>
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold text-gray-700">Daftar Produk</h3>
        <span class="text-xs text-gray-500">Keranjang: {{ cartCount }} item</span>
      </div>

      <!-- TEMPAT KODE DITARUH (Gantikan Grid Produk Lama) -->
      <div v-if="loading" class="text-center py-10 text-gray-500">
        Memuat data dari database...
      </div>

      <div v-else-if="errorMessage" class="text-center py-10 text-red-500">
        {{ errorMessage }}
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        <div 
          v-for="product in products" 
          :key="product.id"
          class="flex flex-col justify-between rounded-xl border border-gray-100 bg-white p-3 shadow-sm hover:shadow-md transition"
        >
          <div class="relative mb-2 aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
            <img :src="product.gambar || 'https://placehold.co/300x300?text=Produk'" :alt="product.nama" class="h-full w-full object-cover" />
            <span 
              :class="[
                'absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-bold text-white',
                product.stok < 10 ? 'bg-red-500' : 'bg-emerald-600'
              ]"
            >
              Stok: {{ product.stok }}
            </span>
          </div>

          <div>
            <span class="text-[10px] font-medium text-gray-400 uppercase">{{ product.kategori }}</span>
            <h4 class="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2">{{ product.nama }}</h4>
            
            <div class="mt-2 flex items-baseline gap-1">
              <span class="text-sm sm:text-base font-bold text-emerald-600">
                Rp {{ Number(product.harga).toLocaleString('id-ID') }}
              </span>
              <span class="text-[10px] text-gray-500">/ {{ product.satuan || 'pcs' }}</span>
            </div>
          </div>

          <button 
            @click="addToCart(product)"
            class="mt-3 w-full rounded-lg bg-emerald-600 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 active:scale-95"
          >
            + Beli
          </button>
        </div>
      </div>
      <!-- END KODE -->
    </section>
  </div>
</template>