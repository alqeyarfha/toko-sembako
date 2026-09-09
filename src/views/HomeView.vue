<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

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
    const rawData = response.data.data || response.data
    products.value = Array.isArray(rawData) ? rawData.filter(item => item !== null) : []
  } catch (error) {
    console.error('Gagal mengambil data produk:', error)
    errorMessage.value = 'Gagal memuat data dari server database.'
  } finally {
    loading.value = false
  }
}

const getCategoryName = (kategori) => {
  if (!kategori) return '-'
  if (typeof kategori === 'object') {
    return kategori.nama_kategori || kategori.nama || '-'
  }
  return kategori
}

const filteredProducts = computed(() => {
  if (selectedCategory.value === 'Semua') {
    return products.value
  }

  const target = selectedCategory.value.toLowerCase()

  return products.value.filter(product => {
    if (!product) return false

    const catName = getCategoryName(product.kategori).toLowerCase()
    const productName = (product.nama_produk || product.nama || '').toLowerCase()
    const categoryId = String(product.kategori_id || product.kategori?.id || '')

    const matchesId =
      (target.includes('beras') && categoryId === '1') ||
      (target.includes('minyak') && categoryId === '2') ||
      (target.includes('bumbu') && categoryId === '3')

    return catName.includes(target) || matchesId || productName.includes(target.split(' ')[0])
  })
})

const goToDetail = (id) => {
  if (!id) return
  router.push(`/produk/${id}`)
}

const apiBaseUrl = (api.defaults.baseURL || 'http://10.10.8.174:8000/api').replace(/\/api\/?$/, '')

const getProductImageUrl = (product) => {
  const imageValue = product?.gambar || product?.foto || product?.image || product?.foto_url || product?.image_url || product?.photo || product?.cover || ''

  if (!imageValue || typeof imageValue !== 'string') {
    return 'https://placehold.co/300x300/cbd5e1/475569?text=Produk'
  }

  const normalized = imageValue.trim()

  if (normalized.startsWith('data:image')) return normalized
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized
  if (normalized.startsWith('/')) return `${apiBaseUrl}${normalized}`

  if (normalized.includes('/') || normalized.includes('\\')) {
    return `${apiBaseUrl}/${normalized.replace(/^\/+/, '')}`
  }

  return `${apiBaseUrl}/storage/${normalized.replace(/^\/+/, '')}`
}

const addToCart = (product, event) => {
  event.stopPropagation()
  if (!product) return

  cartCount.value++

  const cart = JSON.parse(localStorage.getItem('cart') || '[]')
  const existingItem = cart.find(item => item?.id === product.id)

  if (existingItem) {
    existingItem.qty++
  } else {
    cart.push({
      id: product.id,
      nama: product.nama_produk || product.nama,
      harga: product.harga,
      gambar: getProductImageUrl(product),
      qty: 1
    })
  }

  localStorage.setItem('cart', JSON.stringify(cart))
  alert(`${product.nama_produk || product.nama} berhasil ditambahkan ke keranjang!`)
}

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-3xl bg-gradient-to-br from-slate-300 via-slate-200 to-slate-300 p-6 shadow-sm sm:p-8">
      <div class="flex items-center justify-between gap-4">
        <div>
          <span class="inline-flex rounded-full border border-slate-400 bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-700">
            Promo Sembako
          </span>
          <h2 class="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Belanja kebutuhan harianmu dengan praktis
          </h2>
        </div>
      </div>
      <p class="mt-3 max-w-2xl text-sm text-slate-700">
        Kebutuhan dapur harian langsung dari toko terdekat dengan pilihan produk yang rapi dan mudah dipilih.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-300 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm sm:p-6">
      <h3 class="mb-4 text-lg font-semibold text-slate-900">Kategori</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="selectedCategory = cat"
          :class="[
            'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition',
            selectedCategory === cat
              ? 'bg-slate-500 text-white shadow-md'
              : 'border border-slate-300 bg-slate-100 text-slate-700 hover:border-slate-400 hover:bg-slate-200'
          ]"
        >
          {{ cat }}
        </button>
      </div>
    </section>

    <section class="rounded-3xl border border-slate-300 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm sm:p-6">
      <div class="mb-5 flex items-center justify-between gap-3">
        <h3 class="text-lg font-semibold text-slate-900">Daftar Produk</h3>
        <button
          @click="router.push('/keranjang')"
          class="inline-flex items-center gap-2 rounded-lg border border-slate-400 bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:border-slate-500 hover:bg-slate-300"
        >
          🛒 Keranjang: {{ cartCount }} item
        </button>
      </div>

      <div v-if="loading" class="py-12 text-center text-sm text-slate-500">
        Memuat data dari database...
      </div>

      <div v-else-if="errorMessage" class="py-12 text-center text-sm text-red-500">
        {{ errorMessage }}
      </div>

      <div v-else-if="filteredProducts.length === 0" class="py-12 text-center text-sm text-slate-400">
        Tidak ada produk dalam kategori ini.
      </div>

      <div v-else class="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <article
          v-for="product in filteredProducts"
          :key="product?.id || Math.random()"
          @click="product?.id && goToDetail(product.id)"
          class="group flex cursor-pointer flex-col justify-between rounded-2xl border border-slate-300 bg-gradient-to-br from-white to-slate-50 p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md"
        >
          <div class="relative mb-3 overflow-hidden rounded-2xl bg-slate-300">
            <img
              :src="getProductImageUrl(product)"
              :alt="product?.nama_produk || product?.nama || 'Produk'"
              class="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
            />
            <span
              :class="[
                'absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold text-white',
                (product?.stok || 0) < 10 ? 'bg-red-500' : 'bg-slate-500'
              ]"
            >
              Stok: {{ product?.stok || 0 }}
            </span>
          </div>

          <div class="space-y-2">
            <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {{ getCategoryName(product?.kategori) }}
            </p>
            <h4 class="text-sm font-semibold text-slate-800 line-clamp-2">
              {{ product?.nama_produk || product?.nama || 'Tanpa Nama' }}
            </h4>

            <div class="flex items-baseline gap-1">
              <span class="text-base font-bold text-slate-900">
                Rp {{ Number(product?.harga || 0).toLocaleString('id-ID') }}
              </span>
              <span class="text-[10px] text-slate-500">/ {{ product?.satuan || 'pcs' }}</span>
            </div>
          </div>

          <button
            @click="addToCart(product, $event)"
            class="mt-4 w-full rounded-xl bg-slate-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-600"
          >
            + Beli
          </button>
        </article>
      </div>
    </section>
  </div>
</template>