<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createOrder } from '../services/transaksiService'

const router = useRouter()
const cart = ref([])
const loading = ref(false)

const form = ref({
  metode_pembayaran: 'transfer',
  catatan: ''
})

const proofImage = ref('')
const proofFile = ref(null)

const user = computed(() => JSON.parse(localStorage.getItem('user') || '{}'))

const normalizeProductId = (value) => {
  if (value === null || value === undefined || value === '') return null

  const cleanedValue = String(value).split(':')[0].trim()
  const parsedValue = Number(cleanedValue)

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null
}

const totalPrice = computed(() => {
  return cart.value.reduce((sum, item) => sum + (Number(item.harga || 0) * Number(item.qty || 1)), 0)
})

const sanitizeCartForCheckout = () => {
  const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
  const validCart = Array.isArray(savedCart)
    ? savedCart
        .filter(Boolean)
        .map((item) => {
          const productId = normalizeProductId(item?.product_id ?? item?.id ?? item?.produk_id ?? item?.product?.id)

          return {
            ...item,
            id: productId,
            product_id: productId,
            produk_id: productId,
            nama: item?.nama || item?.nama_produk || item?.product?.nama_produk || item?.product?.nama || 'Produk',
            nama_produk: item?.nama_produk || item?.nama || item?.product?.nama_produk || item?.product?.nama || 'Produk',
            harga: Number(item?.harga ?? item?.price ?? item?.product?.harga ?? 0),
            qty: Number(item?.qty ?? item?.quantity ?? 1) || 1
          }
        })
        .filter((item) => item.id && item.harga > 0 && item.qty > 0)
    : []

  cart.value = validCart
  localStorage.setItem('cart', JSON.stringify(validCart))
  return validCart
}

const normalizeCartItems = () => {
  return sanitizeCartForCheckout()
    .map((item) => {
      const productId = normalizeProductId(item.product_id ?? item.id ?? item.produk_id)
      const qty = Number(item.qty || item.quantity || 1)
      const harga = Number(item.harga || 0)

      if (!productId || !qty || !harga) return null

      return {
        product_id: productId,
        produk_id: productId,
        qty,
        quantity: qty,
        harga,
        nama: item.nama || item.nama_produk || 'Produk',
        nama_produk: item.nama_produk || item.nama || 'Produk',
        subtotal: harga * qty,
        total: harga * qty
      }
    })
    .filter(Boolean)
}

const buildCheckoutPayload = (orderItems) => ({
  user_id: user.value.id || null,
  pelanggan_id: user.value.id || null,
  nama_penerima: user.value.name || '',
  no_hp: user.value.no_hp || '',
  alamat: user.value.alamat || '',
  total_harga: totalPrice.value,
  metode_pembayaran: form.value.metode_pembayaran,
  catatan: form.value.catatan || '',
  status: 'pending',
  items: orderItems.map((item) => ({
    product_id: normalizeProductId(item.product_id ?? item.id ?? item.produk_id),
    produk_id: normalizeProductId(item.product_id ?? item.id ?? item.produk_id),
    qty: Number(item.qty || item.quantity || 1),
    jumlah: Number(item.qty || item.quantity || 1),
    harga: Number(item.harga || 0)
  }))
})

const onProofSelected = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('Harap pilih file gambar (JPG, PNG, dsb).')
    event.target.value = ''
    return
  }

  // Maksimum 5MB
  if (file.size > 5 * 1024 * 1024) {
    alert('Ukuran gambar terlalu besar! Maksimal 5 MB.')
    event.target.value = ''
    return
  }

  proofFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    proofImage.value = e.target?.result || ''
  }
  reader.readAsDataURL(file)
}

const removeProofImage = () => {
  proofImage.value = ''
  proofFile.value = null
}

const processCheckout = async () => {
  const validCart = sanitizeCartForCheckout()
  if (!validCart.length) {
    alert('Keranjang kosong, tidak ada yang di-checkout.')
    router.push('/keranjang')
    return
  }

  const orderItems = normalizeCartItems()
  if (!orderItems.length) {
    alert('Keranjang tidak valid. Silakan cek kembali produk yang Anda pilih.')
    router.push('/keranjang')
    return
  }

  loading.value = true

  try {
    const payload = buildCheckoutPayload(orderItems)
    const hasInvalidItems = payload.items.some((item) => !item.product_id || item.qty <= 0 || item.harga <= 0)

    if (hasInvalidItems) {
      throw new Error('Produk dalam keranjang tidak valid. Silakan cek kembali item Anda.')
    }

    // Buat pesanan lewat service terpusat
    const order = await createOrder(payload, proofImage.value)

    localStorage.removeItem('cart')
    alert(order?.id ? `Pesanan berhasil dibuat! ID: #${order.id}. Status: Menunggu Verifikasi Admin.` : 'Pesanan berhasil dibuat!')
    router.push('/riwayat')
  } catch (err) {
    console.error('Checkout error:', err)
    const serverMessage = err.response?.data?.message || err.response?.data?.error || err.response?.data?.errors || err.message
    alert(typeof serverMessage === 'string' ? serverMessage : 'Gagal memproses pesanan.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const validCart = sanitizeCartForCheckout()
  if (!validCart.length) {
    router.push('/keranjang')
  }
})
</script>

<template>
  <div class="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
      <div>
        <h2 class="text-xl font-bold text-slate-800">Konfirmasi Checkout</h2>
        <p class="text-xs text-slate-500">Periksa detail pesanan dan pembayaran Anda</p>
      </div>
      <router-link to="/keranjang" class="text-xs font-semibold text-slate-600 hover:text-slate-900 underline">
        Kembali ke Keranjang
      </router-link>
    </div>

    <form @submit.prevent="processCheckout" class="space-y-6">
      <!-- Alamat Pengiriman -->
      <div class="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
        <div class="flex items-center justify-between">
          <p class="font-bold text-slate-800">Alamat Pengiriman</p>
          <router-link to="/profil" class="text-xs font-medium text-slate-600 hover:text-slate-900 underline">
            Ubah
          </router-link>
        </div>
        <p class="text-slate-700">{{ user.name || '-' }} ({{ user.no_hp || 'No. HP belum diatur' }})</p>
        <p class="text-slate-500 text-xs">{{ user.alamat || 'Alamat belum diatur (Atur di profil)' }}</p>
      </div>

      <!-- Ringkasan Item Belanja -->
      <div class="rounded-xl border border-slate-200 p-4">
        <p class="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Barang yang dibeli ({{ cart.length }} jenis)</p>
        <div class="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1">
          <div v-for="(item, idx) in cart" :key="idx" class="py-2 flex items-center justify-between text-sm">
            <div>
              <p class="font-semibold text-slate-800">{{ item.nama }}</p>
              <p class="text-xs text-slate-500">Rp {{ Number(item.harga || 0).toLocaleString('id-ID') }} x {{ item.qty }}</p>
            </div>
            <span class="font-bold text-slate-700">Rp {{ (Number(item.harga || 0) * Number(item.qty || 1)).toLocaleString('id-ID') }}</span>
          </div>
        </div>
      </div>

      <!-- Pilihan Metode Pembayaran -->
      <div>
        <label class="mb-2 block text-sm font-bold text-slate-700">Metode Pembayaran</label>
        <select v-model="form.metode_pembayaran" class="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-slate-800 bg-white">
          <option value="transfer">Transfer Bank / QRIS</option>
          <option value="cod">Bayar di Tempat (COD)</option>
        </select>
      </div>

      <!-- Detail Rekening & Upload Bukti jika Transfer -->
      <div v-if="form.metode_pembayaran === 'transfer'" class="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 space-y-4">
        <div class="flex items-start gap-3">
          <span class="text-2xl">💳</span>
          <div>
            <h4 class="text-sm font-bold text-slate-900">Rekening Pembayaran Toko Sembako</h4>
            <p class="text-xs text-slate-600">Silakan transfer nominal pas ke nomor rekening di bawah ini:</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-blue-100 text-xs">
          <div class="space-y-0.5">
            <span class="text-slate-400">Bank Transfer</span>
            <p class="font-bold text-slate-800 text-sm">BCA: 883-092-1234</p>
            <p class="text-slate-500">a.n. Toko Sembako Mandiri</p>
          </div>
          <div class="space-y-0.5">
            <span class="text-slate-400">QRIS / E-Wallet</span>
            <p class="font-bold text-slate-800 text-sm">Gopay / OVO / Dana</p>
            <p class="text-slate-500">0812-3456-7890 (Toko Sembako)</p>
          </div>
        </div>

        <!-- Upload Bukti Transaksi -->
        <div class="space-y-2 pt-1">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Upload Bukti Pembayaran / Struk Transfer
            <span class="text-slate-400 font-normal normal-case">(Opsional, bisa juga diunggah nanti di Riwayat)</span>
          </label>

          <!-- Area Preview atau Upload Box -->
          <div v-if="proofImage" class="relative overflow-hidden rounded-xl border-2 border-emerald-300 bg-emerald-50/40 p-3 flex items-center gap-4">
            <img :src="proofImage" alt="Bukti Transfer" class="h-20 w-20 rounded-lg object-cover border border-emerald-200 shadow-sm" />
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-emerald-800">✓ Bukti Transfer Terlampir</p>
              <p class="text-[11px] text-emerald-600 truncate">{{ proofFile?.name || 'struk-transfer.jpg' }}</p>
              <p class="text-[10px] text-slate-500 mt-1">Siap dikirim untuk diverifikasi oleh admin.</p>
            </div>
            <button
              type="button"
              @click="removeProofImage"
              class="rounded-lg bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 text-xs font-semibold transition"
            >
              Hapus
            </button>
          </div>

          <div v-else class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white p-4 hover:border-slate-400 transition">
            <input
              type="file"
              id="proof-input"
              accept="image/*"
              @change="onProofSelected"
              class="hidden"
            />
            <label
              for="proof-input"
              class="flex flex-col items-center justify-center cursor-pointer text-center space-y-1.5"
            >
              <span class="text-2xl">📸</span>
              <span class="text-xs font-bold text-slate-700">Klik untuk Pilih Foto Bukti Pembayaran</span>
              <span class="text-[11px] text-slate-400">Format JPG, PNG, atau WEBP (Maksimal 5MB)</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Catatan Pesanan -->
      <div>
        <label class="mb-2 block text-sm font-bold text-slate-700">Catatan Pesanan (Opsional)</label>
        <textarea v-model="form.catatan" rows="2" placeholder="Contoh: Titip di pos satpam atau jangan dibanting" class="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-slate-800"></textarea>
      </div>

      <!-- Footer / Tombol Buat Pesanan -->
      <div class="flex items-center justify-between border-t border-slate-200 pt-4">
        <div>
          <span class="block text-xs text-slate-500">Total Tagihan</span>
          <span class="text-xl font-black text-slate-800">Rp {{ totalPrice.toLocaleString('id-ID') }}</span>
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="rounded-xl bg-slate-800 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-2"
        >
          <span v-if="loading">Memproses...</span>
          <span v-else>Buat Pesanan & Bayar</span>
        </button>
      </div>
    </form>
  </div>
</template>