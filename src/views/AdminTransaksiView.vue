<template>
  <div class="space-y-6 mx-auto max-w-6xl">
    <!-- Header Halaman -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1">Area Admin</span>
          <span class="text-slate-400 text-xs">•</span>
          <span class="text-slate-500 text-xs">Manajemen Pesanan</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-800 mt-1">Pusat Verifikasi & Kelola Transaksi</h2>
        <p class="text-xs text-slate-500">Periksa bukti pembayaran transfer dari pembeli dan verifikasi pesanan agar segera diproses.</p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="loadOrders"
          class="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition flex items-center gap-1.5"
        >
          <span>↻</span> Segarkan
        </button>
        <router-link
          to="/dashboard"
          class="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-900 transition flex items-center gap-1.5"
        >
          <span>📊</span> Ke Dashboard
        </router-link>
      </div>
    </div>

    <!-- Bar Pencarian & Filter Status -->
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <!-- Input Pencarian -->
        <div class="relative flex-1 min-w-[240px] max-w-md">
          <span class="absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari ID pesanan, nama pembeli, atau catatan..."
            class="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
          />
        </div>

        <!-- Filter Tab Buttons -->
        <div class="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            @click="activeStatusFilter = 'semua'"
            :class="['px-3 py-1.5 rounded-lg font-semibold transition', activeStatusFilter === 'semua' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900']"
          >
            Semua ({{ allOrders.length }})
          </button>
          <button
            @click="activeStatusFilter = 'pending'"
            :class="['px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5', activeStatusFilter === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900']"
          >
            <span>Butuh Verifikasi</span>
            <span class="rounded-full bg-white/25 px-1.5 py-0.2 text-[10px]">{{ countPending }}</span>
          </button>
          <button
            @click="activeStatusFilter = 'terverifikasi'"
            :class="['px-3 py-1.5 rounded-lg font-semibold transition', activeStatusFilter === 'terverifikasi' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900']"
          >
            Terverifikasi ({{ countVerified }})
          </button>
          <button
            @click="activeStatusFilter = 'selesai'"
            :class="['px-3 py-1.5 rounded-lg font-semibold transition', activeStatusFilter === 'selesai' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900']"
          >
            Selesai ({{ countCompleted }})
          </button>
          <button
            @click="activeStatusFilter = 'ditolak'"
            :class="['px-3 py-1.5 rounded-lg font-semibold transition', activeStatusFilter === 'ditolak' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900']"
          >
            Ditolak ({{ countRejected }})
          </button>
        </div>
      </div>
    </div>

    <!-- Alert jika ada pesanan pending -->
    <div v-if="countPending > 0 && activeStatusFilter !== 'pending'" class="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 flex items-center justify-between gap-3 text-xs">
      <div class="flex items-center gap-2.5 text-amber-800">
        <span class="text-lg">⚠️</span>
        <div>
          <span class="font-bold">Ada {{ countPending }} pesanan menunggu verifikasi!</span>
          <span class="text-amber-700 ml-1">Silakan periksa bukti transfer dan klik tombol verifikasi agar pesanan dapat diproses.</span>
        </div>
      </div>
      <button
        @click="activeStatusFilter = 'pending'"
        class="rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 font-semibold text-xs transition shadow-sm"
      >
        Tampilkan Pesanan Pending
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-16 text-center text-slate-500 text-sm font-medium">
      Memuat data transaksi...
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredOrders.length === 0" class="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 text-xs space-y-2">
      <div class="text-3xl">📭</div>
      <p class="font-semibold text-slate-600 text-sm">Tidak ada data transaksi yang sesuai.</p>
      <p>Coba gunakan kata kunci lain atau ubah filter status di atas.</p>
    </div>

    <!-- Tabel Data Transaksi -->
    <div v-else class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 text-[11px] font-bold tracking-wider">
            <tr>
              <th class="p-3.5">ID & Waktu</th>
              <th class="p-3.5">Pelanggan</th>
              <th class="p-3.5">Total & Metode</th>
              <th class="p-3.5 text-center">Bukti Pembayaran</th>
              <th class="p-3.5 text-center">Status</th>
              <th class="p-3.5 text-center">Aksi Verifikasi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr
              v-for="order in filteredOrders"
              :key="order.id"
              :class="['transition hover:bg-slate-50', order.status === 'pending' ? 'bg-amber-50/25' : '']"
            >
              <!-- ID & Waktu -->
              <td class="p-3.5">
                <div class="font-bold text-slate-900">#{{ order.id }}</div>
                <div class="text-[11px] text-slate-400 mt-0.5">
                  {{ order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-' }}
                </div>
              </td>

              <!-- Pelanggan -->
              <td class="p-3.5">
                <div class="font-semibold text-slate-800">{{ getCustomerName(order) }}</div>
                <div class="text-[11px] text-slate-500">{{ order.no_hp || order.user?.no_hp || '-' }}</div>
                <div v-if="order.catatan" class="text-[10px] text-slate-400 italic mt-0.5 truncate max-w-[170px]" :title="order.catatan">
                  "{{ order.catatan }}"
                </div>
              </td>

              <!-- Total Belanja & Metode Bayar -->
              <td class="p-3.5">
                <div class="font-bold text-slate-900">
                  Rp {{ Number(order.total_harga || order.total || 0).toLocaleString('id-ID') }}
                </div>
                <span class="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 uppercase mt-0.5">
                  {{ order.metode_pembayaran === 'transfer' ? 'Transfer Bank' : (order.metode_pembayaran || 'COD') }}
                </span>
              </td>

              <!-- Bukti Pembayaran (Foto Struk) -->
              <td class="p-3.5 text-center">
                <div v-if="order.bukti_transaksi" class="flex flex-col items-center gap-1">
                  <img
                    :src="getProofImageUrl(order.bukti_transaksi)"
                    alt="Bukti Transfer"
                    @click="openProofPreview(order.bukti_transaksi, order.id)"
                    class="h-11 w-11 rounded-lg object-cover border border-slate-200 shadow-sm cursor-pointer hover:scale-105 transition"
                  />
                  <button
                    type="button"
                    @click="openProofPreview(order.bukti_transaksi, order.id)"
                    class="text-[10px] font-semibold text-blue-600 hover:text-blue-800 underline"
                  >
                    Lihat Foto
                  </button>
                </div>
                <div v-else class="text-slate-400 text-[11px] italic">
                  Belum ada bukti
                </div>
              </td>

              <!-- Status Badge -->
              <td class="p-3.5 text-center">
                <span :class="['inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider', getStatusBadgeClass(order.status)]">
                  ● {{ getStatusLabel(order.status) }}
                </span>
              </td>

              <!-- Aksi Verifikasi -->
              <td class="p-3.5 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <!-- Aksi jika Pending -->
                  <template v-if="order.status === 'pending'">
                    <button
                      type="button"
                      :disabled="actionLoadingId === order.id"
                      @click="handleVerify(order.id, 'terverifikasi')"
                      class="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 font-semibold text-xs transition shadow-sm flex items-center gap-1 disabled:opacity-50"
                      title="Setujui & Verifikasi Pembayaran"
                    >
                      <span>✓</span> Verifikasi
                    </button>
                    <button
                      type="button"
                      :disabled="actionLoadingId === order.id"
                      @click="handleVerify(order.id, 'ditolak')"
                      class="rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 px-2.5 py-1.5 font-semibold text-xs transition disabled:opacity-50"
                      title="Tolak Pembayaran"
                    >
                      ✕ Tolak
                    </button>
                  </template>

                  <!-- Aksi jika Terverifikasi -->
                  <template v-else-if="order.status === 'terverifikasi'">
                    <button
                      type="button"
                      :disabled="actionLoadingId === order.id"
                      @click="handleVerify(order.id, 'selesai')"
                      class="rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 font-semibold text-xs transition disabled:opacity-50"
                      title="Tandai pesanan telah selesai dikirim"
                    >
                      ✓ Selesaikan
                    </button>
                  </template>

                  <!-- Tombol Rincian -->
                  <button
                    type="button"
                    @click="openOrderDetail(order)"
                    class="rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-1.5 font-semibold text-xs transition shadow-2xs"
                    title="Buka rincian lengkap pesanan"
                  >
                    Detail
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL PREVIEW GAMBAR BUKTI TRANSAKSI (LIGHTBOX) -->
    <div
      v-if="previewModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-4 backdrop-blur-sm"
      @click.self="closeProofPreview"
    >
      <div class="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 class="font-bold text-slate-800 text-sm">{{ previewOrderTitle }}</h3>
            <p class="text-[11px] text-slate-500">Struk bukti pembayaran transfer dari pembeli</p>
          </div>
          <button
            @click="closeProofPreview"
            class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <div class="max-h-[70vh] overflow-auto rounded-xl bg-slate-100 p-2 flex items-center justify-center">
          <img
            :src="previewImageUrl"
            alt="Bukti Transfer"
            class="max-h-[65vh] w-auto max-w-full rounded-lg object-contain shadow-sm"
          />
        </div>

        <div class="flex items-center justify-between pt-1">
          <div v-if="selectedPreviewOrder && selectedPreviewOrder.status === 'pending'">
            <button
              type="button"
              @click="handleVerify(selectedPreviewOrder.id, 'terverifikasi'); closeProofPreview()"
              class="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
            >
              ✓ Verifikasi Pesanan Ini Sekarang
            </button>
          </div>
          <div v-else></div>
          <button
            type="button"
            @click="closeProofPreview"
            class="rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-900 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DETAIL LENGKAP PESANAN -->
    <div
      v-if="detailModalOpen && selectedDetailOrder"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-4 backdrop-blur-sm"
      @click.self="detailModalOpen = false"
    >
      <div class="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-5">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 class="font-bold text-slate-800 text-base">Rincian Transaksi #{{ selectedDetailOrder.id }}</h3>
            <p class="text-xs text-slate-500">
              Waktu: {{ selectedDetailOrder.created_at ? new Date(selectedDetailOrder.created_at).toLocaleString('id-ID') : '-' }}
            </p>
          </div>
          <button
            @click="detailModalOpen = false"
            class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <!-- Info Pembeli -->
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs space-y-1">
          <p class="font-bold text-slate-800">Nama Penerima: {{ getCustomerName(selectedDetailOrder) }}</p>
          <p class="text-slate-600">No. Telepon: {{ selectedDetailOrder.no_hp || selectedDetailOrder.user?.no_hp || '-' }}</p>
          <p class="text-slate-600">Alamat: {{ selectedDetailOrder.alamat || selectedDetailOrder.user?.alamat || 'Belum diatur' }}</p>
          <p v-if="selectedDetailOrder.catatan" class="text-slate-500 italic">Catatan: "{{ selectedDetailOrder.catatan }}"</p>
        </div>

        <!-- Rincian Produk Pesanan -->
        <div class="space-y-2">
          <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Daftar Barang Belanja</p>
          <div class="max-h-44 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200 p-3 text-xs">
            <div
              v-for="(item, idx) in getOrderItems(selectedDetailOrder)"
              :key="idx"
              class="py-2 flex items-center justify-between"
            >
              <div>
                <span class="font-semibold text-slate-800">{{ item.nama_produk || item.nama || item.product_name || 'Produk' }}</span>
                <span class="text-slate-400 text-[11px] ml-2">x{{ item.qty || item.jumlah || 1 }}</span>
              </div>
              <span class="font-bold text-slate-700">
                Rp {{ ((Number(item.harga || 0)) * Number(item.qty || item.jumlah || 1)).toLocaleString('id-ID') }}
              </span>
            </div>
          </div>
        </div>

        <!-- Bukti Pembayaran di Modal Detail -->
        <div class="rounded-xl border border-slate-200 p-3.5 flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-slate-800">Bukti Pembayaran</p>
            <p class="text-[11px] text-slate-500">
              {{ selectedDetailOrder.bukti_transaksi ? 'Foto struk telah dilampirkan' : 'Belum diunggah oleh pembeli' }}
            </p>
          </div>
          <div v-if="selectedDetailOrder.bukti_transaksi">
            <button
              type="button"
              @click="openProofPreview(selectedDetailOrder.bukti_transaksi, selectedDetailOrder.id)"
              class="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-1.5 text-xs font-semibold transition"
            >
              Lihat Bukti Foto
            </button>
          </div>
        </div>

        <!-- Total Tagihan & Aksi -->
        <div class="flex items-center justify-between border-t border-slate-100 pt-3">
          <div>
            <span class="block text-[11px] text-slate-400 uppercase font-bold">Total Pembayaran</span>
            <span class="text-lg font-black text-slate-900">
              Rp {{ Number(selectedDetailOrder.total_harga || selectedDetailOrder.total || 0).toLocaleString('id-ID') }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              v-if="selectedDetailOrder.status === 'pending'"
              type="button"
              @click="handleVerify(selectedDetailOrder.id, 'terverifikasi'); detailModalOpen = false"
              class="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
            >
              ✓ Verifikasi Sekarang
            </button>
            <button
              type="button"
              @click="detailModalOpen = false"
              class="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { fetchOrders, verifikasiTransaksi, getProofImageUrl } from '../services/transaksiService'

const allOrders = ref([])
const loading = ref(true)
const activeStatusFilter = ref('semua')
const searchQuery = ref('')
const actionLoadingId = ref(null)

// State Modal Preview Bukti
const previewModalOpen = ref(false)
const previewImageUrl = ref('')
const previewOrderTitle = ref('')
const selectedPreviewOrder = ref(null)

// State Modal Detail Pesanan
const detailModalOpen = ref(false)
const selectedDetailOrder = ref(null)

const countPending = computed(() => allOrders.value.filter((o) => (o.status || 'pending').toLowerCase() === 'pending').length)
const countVerified = computed(() => allOrders.value.filter((o) => (o.status || '').toLowerCase() === 'terverifikasi').length)
const countCompleted = computed(() => allOrders.value.filter((o) => (o.status || '').toLowerCase() === 'selesai').length)
const countRejected = computed(() => allOrders.value.filter((o) => (o.status || '').toLowerCase() === 'ditolak').length)

// Filter berdasarkan status dan search bar
const filteredOrders = computed(() => {
  let list = allOrders.value

  if (activeStatusFilter.value !== 'semua') {
    list = list.filter((o) => (o.status || 'pending').toLowerCase() === activeStatusFilter.value.toLowerCase())
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter((o) => {
      const orderId = String(o.id || '').toLowerCase()
      const customer = getCustomerName(o).toLowerCase()
      const phone = String(o.no_hp || o.user?.no_hp || '').toLowerCase()
      const note = String(o.catatan || '').toLowerCase()
      return orderId.includes(q) || customer.includes(q) || phone.includes(q) || note.includes(q)
    })
  }

  return list
})

const getCustomerName = (order) => {
  return order.nama_penerima || order.user?.name || order.pelanggan?.nama || 'Pelanggan'
}

const getOrderItems = (order) => {
  const items = order?.items || order?.order_items || order?.transaksi_items || order?.products || order?.detail || []
  if (Array.isArray(items)) return items
  if (items && typeof items === 'object') return [items]
  return []
}

const getStatusBadgeClass = (status) => {
  const s = String(status || '').toLowerCase()
  if (s === 'pending') return 'bg-amber-100 text-amber-800 border border-amber-200'
  if (s === 'terverifikasi') return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
  if (s === 'diproses') return 'bg-blue-100 text-blue-800 border border-blue-200'
  if (s === 'ditolak') return 'bg-rose-100 text-rose-800 border border-rose-200'
  if (s === 'selesai') return 'bg-slate-100 text-slate-800 border border-slate-300'
  return 'bg-slate-100 text-slate-700 border border-slate-200'
}

const getStatusLabel = (status) => {
  const s = String(status || '').toLowerCase()
  if (s === 'pending') return 'Pending'
  if (s === 'terverifikasi') return 'Terverifikasi'
  if (s === 'diproses') return 'Diproses'
  if (s === 'ditolak') return 'Ditolak'
  if (s === 'selesai') return 'Selesai'
  return status || 'Pending'
}

const openProofPreview = (proofUrl, orderId) => {
  previewImageUrl.value = getProofImageUrl(proofUrl)
  previewOrderTitle.value = `Bukti Pembayaran Pesanan #${orderId}`
  selectedPreviewOrder.value = allOrders.value.find((o) => String(o.id) === String(orderId)) || null
  previewModalOpen.value = true
}

const closeProofPreview = () => {
  previewModalOpen.value = false
  previewImageUrl.value = ''
  selectedPreviewOrder.value = null
}

const openOrderDetail = (order) => {
  selectedDetailOrder.value = order
  detailModalOpen.value = true
}

const handleVerify = async (orderId, targetStatus) => {
  actionLoadingId.value = orderId
  try {
    const res = await verifikasiTransaksi(orderId, targetStatus)
    if (res.success) {
      const idx = allOrders.value.findIndex((o) => String(o.id) === String(orderId))
      if (idx !== -1) {
        allOrders.value[idx].status = targetStatus
      }

      if (targetStatus === 'terverifikasi') {
        alert(`Pesanan #${orderId} berhasil DIVERIFIKASI! Status kini Terverifikasi dan tidak lagi Pending.`)
      } else if (targetStatus === 'ditolak') {
        alert(`Pesanan #${orderId} telah ditolak.`)
      } else if (targetStatus === 'selesai') {
        alert(`Pesanan #${orderId} telah selesai.`)
      }
    }
  } catch (err) {
    console.error('Gagal verifikasi transaksi:', err)
    alert('Gagal memverifikasi transaksi. Silakan coba lagi.')
  } finally {
    actionLoadingId.value = null
  }
}

const loadOrders = async () => {
  loading.value = true
  try {
    allOrders.value = await fetchOrders(true)
  } catch (err) {
    console.error('Gagal mengambil daftar transaksi admin:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrders()
  window.addEventListener('transaksi-updated', loadOrders)
})

onUnmounted(() => {
  window.removeEventListener('transaksi-updated', loadOrders)
})
</script>
