<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const cart = ref([])
const loading = ref(false)

const form = ref({
  metode_pembayaran: 'transfer',
  catatan: ''
})

const user = computed(() => JSON.parse(localStorage.getItem('user') || '{}'))

const totalPrice = computed(() => {
  return cart.value.reduce((sum, i) => sum + (Number(i.harga) * i.qty), 0)
})

const processCheckout = async () => {
  if (cart.value.length === 0) return
  loading.value = true

  try {
    const payload = {
      items: cart.value,
      total_harga: totalPrice.value,
      metode_pembayaran: form.value.metode_pembayaran,
      catatan: form.value.catatan
    }

    await api.post('/orders', payload)
    localStorage.removeItem('cart')
    alert('Transaksi berhasil dibuat!')
    router.push('/riwayat')
  } catch (err) {
    alert('Gagal memproses pesanan.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cart.value = JSON.parse(localStorage.getItem('cart') || '[]')
  if (cart.value.length === 0) router.push('/keranjang')
})
</script>

<template>
  <div class="max-w-3xl mx-auto bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <h2 class="text-xl font-bold text-slate-800 mb-6">Konfirmasi Checkout</h2>

    <form @submit.prevent="processCheckout" class="space-y-6">
      <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm space-y-1">
        <p class="font-bold text-slate-800">Alamat Pengiriman</p>
        <p class="text-slate-600">{{ user.name }} ({{ user.no_hp || '-' }})</p>
        <p class="text-slate-500">{{ user.alamat || 'Alamat belum diatur' }}</p>
      </div>

      <div>
        <label class="block text-sm font-bold text-slate-700 mb-2">Metode Pembayaran</label>
        <select v-model="form.metode_pembayaran" class="w-full border p-2.5 rounded-lg text-sm border-slate-300 focus:outline-slate-800">
          <option value="transfer">Transfer Bank / QRIS</option>
          <option value="cod">Bayar di Tempat (COD)</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-bold text-slate-700 mb-2">Catatan Pesanan</label>
        <textarea v-model="form.catatan" placeholder="Contoh: Titip di pos satpam" class="w-full border p-2.5 rounded-lg text-sm border-slate-300 focus:outline-slate-800" rows="2"></textarea>
      </div>

      <div class="border-t border-slate-200 pt-4 flex justify-between items-center">
        <div>
          <span class="text-xs text-slate-500 block">Total Tagihan</span>
          <span class="text-lg font-bold text-slate-800">Rp {{ totalPrice.toLocaleString('id-ID') }}</span>
        </div>
        <button type="submit" :disabled="loading" class="bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-900 transition">
          {{ loading ? 'Memproses...' : 'Buat Pesanan' }}
        </button>
      </div>
    </form>
  </div>
</template>