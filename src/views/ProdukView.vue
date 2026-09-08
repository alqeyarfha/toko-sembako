<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const products = ref([])
const loading = ref(false)
const isModalOpen = ref(false)
const isEdit = ref(false)

const form = ref({
  id: null,
  nama_produk: '',
  kategori_id: '1',
  harga: '',
  stok: '',
  satuan: 'kg',
  gambar: ''
})

const fetchProducts = async () => {
  loading.value = true
  try {
    const res = await api.get('/products')
    products.value = res.data.data || res.data
  } catch (err) {
    alert('Gagal mengambil data produk')
  } finally {
    loading.value = false
  }
}

const openModal = (product = null) => {
  if (product) {
    isEdit.value = true
    form.value = {
      id: product.id,
      nama_produk: product.nama_produk || product.nama || '',
      kategori_id: typeof product.kategori === 'object' && product.kategori !== null ? product.kategori.id : (product.kategori_id || '1'),
      harga: product.harga || '',
      stok: product.stok || '',
      satuan: product.satuan || 'kg',
      gambar: product.gambar || ''
    }
  } else {
    isEdit.value = false
    form.value = { id: null, nama_produk: '', kategori_id: '1', harga: '', stok: '', satuan: 'kg', gambar: '' }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const handleSubmit = async () => {
  try {
    const payload = {
      ...form.value,
      nama: form.value.nama_produk // Fallback jika backend minta 'nama'
    }

    if (isEdit.value) {
      await api.put(`/products/${form.value.id}`, payload)
      alert('Produk berhasil diperbarui!')
    } else {
      await api.post('/products', payload)
      alert('Produk berhasil ditambahkan!')
    }
    closeModal()
    fetchProducts()
  } catch (err) {
    alert('Gagal menyimpan data produk. Cek kembali kelengkapan input.')
  }
}

const deleteProduct = async (id) => {
  if (confirm('Yakin ingin menghapus produk ini?')) {
    try {
      await api.delete(`/products/${id}`)
      alert('Produk berhasil dihapus!')
      fetchProducts()
    } catch (err) {
      alert('Gagal menghapus produk')
    }
  }
}

// Helper untuk ekstrak teks nama kategori dari String atau Object JSON
const getCategoryName = (kategori) => {
  if (!kategori) return '-'
  if (typeof kategori === 'object') {
    return kategori.nama_kategori || kategori.nama || '-'
  }
  return kategori
}

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Manajemen Stok Produk</h2>
      <button @click="openModal()" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700">
        + Tambah Produk
      </button>
    </div>

    <!-- Tabel Data -->
    <div class="bg-white rounded-xl shadow overflow-hidden">
      <table class="w-full text-left text-sm text-gray-600">
        <thead class="bg-gray-100 text-xs uppercase text-gray-700">
          <tr>
            <th class="p-3">Nama Produk</th>
            <th class="p-3">Kategori</th>
            <th class="p-3">Harga</th>
            <th class="p-3">Stok</th>
            <th class="p-3 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="5" class="text-center p-4">Memuat data...</td></tr>
          <tr v-else-if="products.length === 0"><td colspan="5" class="text-center p-4">Belum ada data produk.</td></tr>
          <tr v-else v-for="p in products" :key="p.id" class="border-b hover:bg-gray-50">
            <td class="p-3 font-medium text-gray-900">{{ p.nama_produk || p.nama }}</td>
            <td class="p-3">
              <span class="bg-gray-100 px-2 py-1 rounded text-xs font-semibold text-gray-700">
                {{ getCategoryName(p.kategori) }}
              </span>
            </td>
            <td class="p-3">Rp {{ Number(p.harga || 0).toLocaleString('id-ID') }}</td>
            <td class="p-3">{{ p.stok }} {{ p.satuan || 'pcs' }}</td>
            <td class="p-3 text-center">
              <button @click="openModal(p)" class="text-blue-600 hover:underline mr-3">Edit</button>
              <button @click="deleteProduct(p.id)" class="text-red-600 hover:underline">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 class="text-lg font-bold mb-4">{{ isEdit ? 'Edit Produk' : 'Tambah Produk Baru' }}</h3>
        <form @submit.prevent="handleSubmit" class="space-y-3">
          <input v-model="form.nama_produk" placeholder="Nama Produk" required class="w-full border p-2 rounded text-sm focus:outline-emerald-600" />
          
          <div class="grid grid-cols-2 gap-2">
            <select v-model="form.kategori_id" class="border p-2 rounded text-sm focus:outline-emerald-600">
              <option value="1">Beras & Tepung</option>
              <option value="2">Minyak & Gula</option>
              <option value="3">Bumbu Dapur</option>
            </select>

            <input v-model="form.satuan" placeholder="Satuan (kg/pcs/pouch)" required class="border p-2 rounded text-sm focus:outline-emerald-600" />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <input v-model.number="form.harga" type="number" placeholder="Harga (Rp)" required class="border p-2 rounded text-sm focus:outline-emerald-600" />
            <input v-model.number="form.stok" type="number" placeholder="Jumlah Stok" required class="border p-2 rounded text-sm focus:outline-emerald-600" />
          </div>

          <div class="flex justify-end gap-2 mt-4">
            <button type="button" @click="closeModal" class="px-4 py-2 text-sm border rounded hover:bg-gray-50">Batal</button>
            <button type="submit" class="px-4 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>