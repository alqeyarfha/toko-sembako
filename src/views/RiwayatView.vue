<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { fetchOrders, uploadBuktiTransaksi, getProofImageUrl } from '../services/transaksiService'

const orders = ref([])
const loading = ref(true)

// State Modal Preview Bukti Pembayaran
const previewModalOpen = ref(false)
const previewImageUrl = ref('')
const previewOrderTitle = ref('')

// State Modal Upload Bukti Pembayaran
const uploadModalOpen = ref(false)
const selectedOrder = ref(null)
const uploadImageBase64 = ref('')
const uploadFileObj = ref(null)
const uploading = ref(false)

const getOrderItems = (order) => {
  const items = order?.items || order?.order_items || order?.transaksi_items || order?.products || order?.detail || order?.data || []
  if (Array.isArray(items)) return items
  if (items && typeof items === 'object') return [items]
  return []
}

const formatCurrency = (value) => {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`
}

const getStatusBadgeClass = (status) => {
  const s = String(status || '').toLowerCase()
  if (s === 'pending') {
    return 'bg-amber-100 text-amber-800 border border-amber-200'
  }
  if (s === 'terverifikasi') {
    return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
  }
  if (s === 'diproses') {
    return 'bg-blue-100 text-blue-800 border border-blue-200'
  }
  if (s === 'ditolak') {
    return 'bg-rose-100 text-rose-800 border border-rose-200'
  }
  if (s === 'selesai') {
    return 'bg-slate-100 text-slate-800 border border-slate-300'
  }
  return 'bg-slate-100 text-slate-700 border border-slate-200'
}

const getStatusLabel = (status) => {
  const s = String(status || '').toLowerCase()
  if (s === 'pending') return 'Menunggu Verifikasi Admin'
  if (s === 'terverifikasi') return 'Terverifikasi (Pembayaran Diterima)'
  if (s === 'diproses') return 'Sedang Diproses'
  if (s === 'ditolak') return 'Ditolak'
  if (s === 'selesai') return 'Selesai'
  return status || 'Pending'
}

const loadOrdersData = async () => {
  loading.value = true
  try {
    orders.value = await fetchOrders(false)
  } catch (err) {
    console.error('Gagal memuat riwayat:', err)
  } finally {
    loading.value = false
  }
}

// Buka modal pratinjau gambar bukti
const openProofPreview = (proofUrl, orderId) => {
  previewImageUrl.value = getProofImageUrl(proofUrl)
  previewOrderTitle.value = `Bukti Pembayaran Pesanan #${orderId}`
  previewModalOpen.value = true
}

const closeProofPreview = () => {
  previewModalOpen.value = false
  previewImageUrl.value = ''
}

// Buka modal upload bukti
const openUploadModal = (order) => {
  selectedOrder.value = order
  uploadImageBase64.value = ''
  uploadFileObj.value = null
  uploadModalOpen.value = true
}

const closeUploadModal = () => {
  uploadModalOpen.value = false
  selectedOrder.value = null
  uploadImageBase64.value = ''
  uploadFileObj.value = null
}

const handleProofFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('Harap pilih file gambar (JPG, PNG, dsb).')
    event.target.value = ''
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('Ukuran gambar terlalu besar! Maksimal 5 MB.')
    event.target.value = ''
    return
  }

  uploadFileObj.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    uploadImageBase64.value = e.target?.result || ''
  }
  reader.readAsDataURL(file)
}

const submitUploadProof = async () => {
  if (!uploadImageBase64.value || !selectedOrder.value) {
    alert('Silakan pilih foto bukti pembayaran terlebih dahulu.')
    return
  }

  uploading.value = true
  try {
    await uploadBuktiTransaksi(selectedOrder.value.id, uploadImageBase64.value, uploadFileObj.value)
    alert('Bukti pembayaran berhasil diunggah! Admin akan segera memverifikasi pesanan Anda.')
    closeUploadModal()
    await loadOrdersData()
  } catch (err) {
    console.error('Gagal upload bukti:', err)
    alert('Gagal mengunggah bukti pembayaran. Silakan coba lagi.')
  } finally {
    uploading.value = false
  }
}

onMounted(() => {
  loadOrdersData()
  window.addEventListener('transaksi-updated', loadOrdersData)
})

onUnmounted(() => {
  window.removeEventListener('transaksi-updated', loadOrdersData)
})
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Riwayat Transaksi</h2>
        <p class="text-xs text-slate-500">Pantau status pesanan dan bukti pembayaran Anda</p>
      </div>
      <button
        @click="loadOrdersData"
        class="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
      >
        ↻ Refresh
      </button>
    </div>

    <div v-if="loading" class="py-14 text-center text-slate-500 font-medium">
      Memuat riwayat transaksi...
    </div>

    <div v-else-if="orders.length === 0" class="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm space-y-3">
      <div class="text-4xl">🛍️</div>
      <p class="font-semibold text-slate-700 text-base">Belum ada riwayat transaksi</p>
      <p class="text-xs text-slate-400">Silakan belanja kebutuhan dapur dan sembako favorit Anda sekarang.</p>
      <router-link to="/" class="inline-block mt-2 rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-900 transition">
        Mulai Belanja
      </router-link>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="order in orders"
        :key="order.id || Math.random()"
        class="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
      >
        <!-- Header Kartu Pesanan -->
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2 text-xs">
            <span class="font-bold text-slate-800">ID Pesanan: #{{ order.id || '-' }}</span>
            <span class="text-slate-400">•</span>
            <span class="text-slate-500">
              {{ order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-' }}
            </span>
          </div>

          <!-- Status Badge -->
          <span :class="['rounded-full px-3 py-1 text-xs font-bold tracking-wide transition', getStatusBadgeClass(order.status)]">
            ● {{ getStatusLabel(order.status) }}
          </span>
        </div>

        <!-- Rincian Nilai & Produk -->
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-xs text-slate-500">Total Tagihan</p>
            <p class="text-lg font-black text-slate-800">{{ formatCurrency(order.total_harga || order.total || 0) }}</p>
          </div>
          <div class="text-right text-xs text-slate-600">
            <span class="inline-block rounded-lg bg-slate-100 px-2.5 py-1 font-medium capitalize">
              Metode: {{ order.metode_pembayaran === 'transfer' ? 'Transfer Bank / QRIS' : (order.metode_pembayaran || 'COD') }}
            </span>
          </div>
        </div>

        <!-- Daftar Produk -->
        <div v-if="getOrderItems(order).length" class="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
          <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Rincian Barang</p>
          <div
            v-for="(item, index) in getOrderItems(order)"
            :key="index"
            class="flex items-center justify-between text-xs text-slate-700"
          >
            <span class="font-medium">• {{ item.nama_produk || item.nama || item.product_name || 'Produk' }}</span>
            <span class="font-semibold">{{ item.qty || item.jumlah || 1 }}x</span>
          </div>
        </div>

        <!-- Section Bukti Transaksi (PENTING) -->
        <div class="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <span class="text-xl">🧾</span>
              <div>
                <p class="text-xs font-bold text-slate-800">Bukti Pembayaran Transaksi</p>
                <p class="text-[11px] text-slate-500">
                  <span v-if="order.bukti_transaksi" class="text-emerald-700 font-semibold">✓ Bukti pembayaran telah dilampirkan</span>
                  <span v-else-if="order.status === 'pending'" class="text-amber-700 font-medium">⚠️ Belum ada bukti transfer yang diunggah</span>
                  <span v-else class="text-slate-400">Tidak ada bukti pembayaran</span>
                </p>
              </div>
            </div>

            <!-- Tombol Aksi Bukti -->
            <div class="flex items-center gap-2">
              <!-- Jika sudah ada bukti: tombol Lihat Bukti -->
              <button
                v-if="order.bukti_transaksi"
                type="button"
                @click="openProofPreview(order.bukti_transaksi, order.id)"
                class="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-1.5 text-xs font-semibold shadow-sm transition"
              >
                <span>👁️</span> Lihat Bukti
              </button>

              <!-- Jika status masih pending: tombol Upload / Ganti Bukti -->
              <button
                v-if="order.status === 'pending'"
                type="button"
                @click="openUploadModal(order)"
                class="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-1.5 text-xs font-semibold shadow-sm transition"
              >
                <span>📤</span> {{ order.bukti_transaksi ? 'Ganti Bukti' : 'Upload Bukti' }}
              </button>
            </div>
          </div>

          <!-- Thumbnail Pratinjau Kecil jika sudah ada bukti -->
          <div v-if="order.bukti_transaksi" class="mt-2.5 flex items-center gap-3 pt-2 border-t border-slate-200/60">
            <img
              :src="getProofImageUrl(order.bukti_transaksi)"
              alt="Bukti Transfer"
              @click="openProofPreview(order.bukti_transaksi, order.id)"
              class="h-12 w-12 rounded-lg object-cover border border-slate-200 shadow-sm cursor-pointer hover:opacity-80 transition"
            />
            <div class="text-[11px] text-slate-500">
              <span class="block font-medium text-slate-700">Foto Bukti Transfer</span>
              <span>Klik gambar untuk memperbesar</span>
            </div>
          </div>

          <!-- Pesan khusus jika status sudah terverifikasi -->
          <div v-if="order.status === 'terverifikasi'" class="mt-2 text-[11px] text-emerald-800 bg-emerald-50 rounded-lg p-2 border border-emerald-100 flex items-center gap-2">
            <span>✅</span>
            <span>Pembayaran Anda telah <strong>diverifikasi oleh Admin</strong>. Pesanan sedang dipersiapkan untuk dikirim!</span>
          </div>
        </div>

        <div v-if="order.catatan" class="text-xs text-slate-500 italic">
          Catatan: "{{ order.catatan }}"
        </div>
      </div>
    </div>

    <!-- MODAL PREVIEW BUKTI TRANSAKSI (LIGHTBOX) -->
    <div
      v-if="previewModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm"
      @click.self="closeProofPreview"
    >
      <div class="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="font-bold text-slate-800 text-sm">{{ previewOrderTitle }}</h3>
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
            alt="Foto Bukti Pembayaran"
            class="max-h-[65vh] w-auto max-w-full rounded-lg object-contain shadow-sm"
          />
        </div>

        <div class="flex justify-end">
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

    <!-- MODAL UPLOAD BUKTI TRANSAKSI -->
    <div
      v-if="uploadModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm"
      @click.self="closeUploadModal"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 class="font-bold text-slate-800 text-base">Unggah Bukti Pembayaran</h3>
            <p class="text-xs text-slate-500">Pesanan #{{ selectedOrder?.id }}</p>
          </div>
          <button
            @click="closeUploadModal"
            class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <div class="space-y-3">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700">Pilih Foto Struk / Bukti Transfer</label>

          <!-- Input File -->
          <div class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-4 hover:border-slate-400 transition bg-slate-50">
            <input
              type="file"
              id="upload-proof-input"
              accept="image/*"
              @change="handleProofFileSelect"
              class="hidden"
            />
            <label
              for="upload-proof-input"
              class="flex flex-col items-center justify-center cursor-pointer text-center space-y-1"
            >
              <span class="text-3xl">📷</span>
              <span class="text-xs font-bold text-slate-700">Pilih Gambar Bukti</span>
              <span class="text-[11px] text-slate-400">JPG, PNG, atau WEBP (Maksimal 5MB)</span>
            </label>
          </div>

          <!-- Preview Gambar Terpilih -->
          <div v-if="uploadImageBase64" class="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 flex items-center gap-3">
            <img :src="uploadImageBase64" alt="Pratinjau" class="h-16 w-16 rounded-lg object-cover border border-emerald-300" />
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-emerald-800">✓ Gambar Siap Dikirim</p>
              <p class="text-[11px] text-emerald-600 truncate">{{ uploadFileObj?.name || 'bukti-transfer.jpg' }}</p>
            </div>
            <button
              type="button"
              @click="uploadImageBase64 = ''; uploadFileObj = null"
              class="text-xs font-bold text-red-600 hover:underline"
            >
              Hapus
            </button>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            @click="closeUploadModal"
            class="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Batal
          </button>
          <button
            type="button"
            :disabled="!uploadImageBase64 || uploading"
            @click="submitUploadProof"
            class="rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ uploading ? 'Mengunggah...' : 'Kirim Bukti Pembayaran' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>