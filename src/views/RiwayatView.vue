<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const orders = ref([])
const loading = ref(true)

const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await api.get('/orders')
    orders.value = res.data.data || res.data
  } catch (err) {
    console.error('Gagal memuat riwayat:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchOrders())
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-4">
    <h2 class="text-xl font-bold text-slate-800">Riwayat Transaksi</h2>

    <div v-if="loading" class="text-center py-10 text-slate-500">Memuat riwayat...</div>
    <div v-else-if="orders.length === 0" class="bg-white p-8 text-center text-slate-500 rounded-xl border border-slate-200">
      Belum ada transaksi.
    </div>

    <div v-else v-for="order in orders" :key="order.id" class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
      <div class="flex justify-between items-center border-b border-slate-100 pb-2 text-xs text-slate-500">
        <span>ID Pesanan: #{{ order.id }}</span>
        <span class="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-bold uppercase">{{ order.status || 'Selesai' }}</span>
      </div>

      <div class="flex justify-between items-center">
        <div>
          <p class="font-bold text-slate-800 text-sm">Total Belanja</p>
          <p class="text-xs text-slate-500">{{ order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID') : '-' }}</p>
        </div>
        <span class="font-bold text-slate-800 text-base">Rp {{ Number(order.total_harga || 0).toLocaleString('id-ID') }}</span>
      </div>
    </div>
  </div>
</template>