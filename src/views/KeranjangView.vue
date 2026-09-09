<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const cart = ref([])
const apiBaseUrl = 'http://10.10.8.174:8000'

const loadCart = () => {
  cart.value = JSON.parse(localStorage.getItem('cart') || '[]')
}

const updateQty = (id, delta) => {
  const item = cart.value.find(i => i.id === id)
  if (item) {
    item.qty += delta
    if (item.qty <= 0) {
      cart.value = cart.value.filter(i => i.id !== id)
    }
    localStorage.setItem('cart', JSON.stringify(cart.value))
  }
}

const removeItem = (id) => {
  cart.value = cart.value.filter(i => i.id !== id)
  localStorage.setItem('cart', JSON.stringify(cart.value))
}

const totalPrice = computed(() => {
  return cart.value.reduce((sum, i) => sum + (Number(i.harga) * i.qty), 0)
})

const goToCheckout = () => {
  if (cart.value.length === 0) return
  router.push('/checkout')
}

const getCartImageUrl = (item) => {
  const imageValue = item?.gambar || item?.foto || item?.image || item?.foto_url || item?.image_url || item?.photo || item?.cover || ''

  if (!imageValue) return 'https://placehold.co/100'

  const normalized = String(imageValue).trim()

  if (normalized.startsWith('data:image')) return normalized
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized
  if (normalized.startsWith('/')) return `${apiBaseUrl}${normalized}`

  if (normalized.includes('/') || normalized.includes('\\')) {
    return `${apiBaseUrl}/${normalized.replace(/^\/+/, '')}`
  }

  return `${apiBaseUrl}/storage/${normalized.replace(/^\/+/, '')}`
}

onMounted(() => loadCart())
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <h2 class="text-xl font-bold text-slate-800 mb-4">Keranjang Belanja</h2>

    <div v-if="cart.length === 0" class="bg-white p-8 rounded-xl text-center text-slate-500 border border-slate-200">
      Keranjang Anda masih kosong. <router-link to="/" class="text-slate-800 underline font-semibold">Belanja Sekarang</router-link>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2 space-y-3">
        <div v-for="item in cart" :key="item.id" class="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div class="flex items-center gap-3">
            <img :src="getCartImageUrl(item)" class="w-16 h-16 object-cover rounded-lg bg-slate-100" />
            <div>
              <h4 class="font-semibold text-slate-800 text-sm">{{ item.nama }}</h4>
              <p class="text-xs text-slate-500">Rp {{ Number(item.harga).toLocaleString('id-ID') }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center border border-slate-300 rounded-lg overflow-hidden">
              <button @click="updateQty(item.id, -1)" class="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200">-</button>
              <span class="px-3 text-xs font-bold text-slate-800">{{ item.qty }}</span>
              <button @click="updateQty(item.id, 1)" class="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200">+</button>
            </div>
            <button @click="removeItem(item.id)" class="text-red-500 hover:text-red-700 text-xs font-semibold">Hapus</button>
          </div>
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-slate-200 h-fit space-y-4 shadow-sm">
        <h3 class="font-bold text-slate-800 border-b border-slate-200 pb-2">Ringkasan Pesanan</h3>
        <div class="flex justify-between text-sm">
          <span class="text-slate-500">Total Harga</span>
          <span class="font-bold text-slate-800">Rp {{ totalPrice.toLocaleString('id-ID') }}</span>
        </div>
        <button @click="goToCheckout" class="w-full bg-slate-800 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-900 transition">
          Lanjut ke Checkout
        </button>
      </div>
    </div>
  </div>
</template>