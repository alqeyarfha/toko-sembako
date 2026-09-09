<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

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
  deskripsi: '',
  gambar: ''
})

const previewImage = ref('')
const imageFile = ref(null)

const categoryOptions = [
  { id: '1', name: 'Beras & Tepung' },
  { id: '2', name: 'Minyak & Gula' },
  { id: '3', name: 'Gula & Garam' },
  { id: '4', name: 'Minyak & Margarin' },
  { id: '5', name: 'Bumbu Dapur' }
]

const onImageSelect = (event) => {
  const file = event.target.files?.[0]
  if (!file) {
    imageFile.value = null
    previewImage.value = ''
    return
  }

  if (!file.type.startsWith('image/')) {
    alert('File yang dipilih harus berupa gambar.')
    event.target.value = ''
    imageFile.value = null
    previewImage.value = ''
    return
  }

  imageFile.value = file

  const reader = new FileReader()
  reader.onload = (e) => {
    previewImage.value = e.target?.result || ''
  }
  reader.readAsDataURL(file)
}

const fetchProducts = async () => {
  loading.value = true

  try {
    const res = await api.get('/products')
    const rawData = res.data.data || res.data
    products.value = Array.isArray(rawData) ? rawData.filter(item => item !== null) : []
  } catch (err) {
    if (err.response?.status === 401) {
      alert('Sesi login berakhir. Silakan login kembali.')
      router.push('/login')
    } else {
      alert('Gagal mengambil data produk')
    }
  } finally {
    loading.value = false
  }
}

const openModal = (product = null) => {
  imageFile.value = null
  previewImage.value = ''

  if (product && typeof product === 'object') {
    isEdit.value = true
    form.value = {
      id: String(product.id).split(':')[0],
      nama_produk: product.nama_produk || product.nama || '',
      kategori_id: typeof product.kategori === 'object' && product.kategori !== null
        ? String(product.kategori.id || '1')
        : String(product.kategori_id || '1'),
      harga: product.harga || '',
      stok: product.stok || '',
      satuan: product.satuan || 'kg',
      deskripsi: product.deskripsi || '',
      gambar: product.gambar || product.foto || ''
    }
    previewImage.value = product.gambar || product.foto || ''
  } else {
    isEdit.value = false
    form.value = {
      id: null,
      nama_produk: '',
      kategori_id: '1',
      harga: '',
      stok: '',
      satuan: 'kg',
      deskripsi: '',
      gambar: ''
    }
  }

  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const handleSubmit = async () => {
  try {
    const payload = {
      nama_produk: form.value.nama_produk,
      nama: form.value.nama_produk,
      kategori_id: form.value.kategori_id,
      harga: Number(form.value.harga),
      stok: Number(form.value.stok),
      satuan: form.value.satuan,
      deskripsi: form.value.deskripsi || '',
      gambar: form.value.gambar || '',
      foto: form.value.gambar || ''
    }

    if (imageFile.value instanceof File) {
      const formData = new FormData()
      formData.append('nama_produk', form.value.nama_produk)
      formData.append('nama', form.value.nama_produk)
      formData.append('kategori_id', String(form.value.kategori_id))
      formData.append('harga', String(Number(form.value.harga)))
      formData.append('stok', String(Number(form.value.stok)))
      formData.append('satuan', form.value.satuan)
      formData.append('deskripsi', form.value.deskripsi || '')
      formData.append('foto', imageFile.value)
      formData.append('gambar', imageFile.value)

      if (isEdit.value && form.value.id) {
        const cleanId = String(form.value.id).split(':')[0]
        await api.put(`/products/${cleanId}`, formData)
        alert('Produk berhasil diperbarui!')
      } else {
        await api.post('/products', formData)
        alert('Produk berhasil ditambahkan!')
      }
    } else {
      if (isEdit.value && form.value.id) {
        const cleanId = String(form.value.id).split(':')[0]
        await api.put(`/products/${cleanId}`, payload)
        alert('Produk berhasil diperbarui!')
      } else {
        await api.post('/products', payload)
        alert('Produk berhasil ditambahkan!')
      }
    }

    closeModal()
    fetchProducts()
  } catch (err) {
    console.error('Error submit:', err.response?.data || err.message)
    if (err.response?.status === 401) {
      alert('Sesi login telah habis. Silakan logout dan login kembali.')
      router.push('/login')
    } else if (err.response?.data?.message) {
      alert(`Error: ${err.response.data.message}`)
    } else {
      alert('Gagal menyimpan data produk. Cek kembali kelengkapan input.')
    }
  }
}

const deleteProduct = async (id) => {
  if (!id) return

  const cleanId = String(id).split(':')[0]
  if (confirm('Yakin ingin menghapus produk ini?')) {
    try {
      await api.delete(`/products/${cleanId}`)
      alert('Produk berhasil dihapus!')
      fetchProducts()
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Sesi login telah habis. Silakan login kembali.')
        router.push('/login')
      } else {
        alert('Gagal menghapus produk')
      }
    }
  }
}

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
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-sm font-medium uppercase tracking-[0.2em] text-slate-600">Admin</p>
        <h2 class="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Manajemen Stok Produk</h2>
      </div>

      <button
        @click="openModal()"
        class="rounded-xl bg-slate-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-600"
      >
        + Tambah Produk
      </button>
    </div>

    <div class="overflow-hidden rounded-3xl border border-slate-300 bg-gradient-to-br from-white to-slate-50 shadow-sm">
      <table class="w-full text-left text-sm text-slate-600">
        <thead class="bg-slate-200 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
          <tr>
            <th class="p-4">Nama Produk</th>
            <th class="p-4">Kategori</th>
            <th class="p-4">Harga</th>
            <th class="p-4">Stok</th>
            <th class="p-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="p-8 text-center text-slate-500">Memuat data...</td>
          </tr>
          <tr v-else-if="products.length === 0">
            <td colspan="5" class="p-8 text-center text-slate-500">Belum ada data produk.</td>
          </tr>
          <tr v-else v-for="p in products" :key="p?.id || Math.random()" class="border-t border-slate-300 hover:bg-slate-100">
            <td class="p-4 font-medium text-slate-800">{{ p?.nama_produk || p?.nama || '-' }}</td>
            <td class="p-4">
              <span class="inline-flex rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                {{ getCategoryName(p?.kategori) }}
              </span>
            </td>
            <td class="p-4">Rp {{ Number(p?.harga || 0).toLocaleString('id-ID') }}</td>
            <td class="p-4">{{ p?.stok || 0 }} {{ p?.satuan || 'pcs' }}</td>
            <td class="p-4 text-center">
              <div class="flex items-center justify-center gap-3">
                <button @click="openModal(p)" class="text-sm font-medium text-slate-700 hover:text-slate-900">Edit</button>
                <button @click="p?.id && deleteProduct(p.id)" class="text-sm font-medium text-red-500 hover:text-red-600">Hapus</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div class="w-full max-w-md rounded-3xl border border-slate-300 bg-white p-6 shadow-2xl">
        <div class="mb-5 flex items-center justify-between">
          <h3 class="text-xl font-semibold text-slate-900">{{ isEdit ? 'Edit Produk' : 'Tambah Produk Baru' }}</h3>
          <button @click="closeModal" class="text-sm text-slate-500 hover:text-slate-800">✕</button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <input
            v-model="form.nama_produk"
            placeholder="Nama Produk"
            required
            class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:bg-white"
          />

          <div class="grid grid-cols-2 gap-3">
            <select v-model="form.kategori_id" class="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:bg-white">
              <option v-for="category in categoryOptions" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>

            <input
              v-model="form.satuan"
              placeholder="Satuan"
              required
              class="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:bg-white"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <input
              v-model.number="form.harga"
              type="number"
              placeholder="Harga (Rp)"
              required
              class="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:bg-white"
            />
            <input
              v-model.number="form.stok"
              type="number"
              placeholder="Jumlah Stok"
              required
              class="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:bg-white"
            />
          </div>

          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Deskripsi Produk</label>
            <textarea
              v-model="form.deskripsi"
              rows="3"
              placeholder="Masukkan deskripsi produk"
              class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:bg-white"
            ></textarea>
          </div>

          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Gambar Produk</label>
            <div class="space-y-3">
              <div v-if="previewImage" class="relative h-32 w-full overflow-hidden rounded-xl bg-slate-200">
                <img :src="previewImage" :alt="form.nama_produk" class="h-full w-full object-cover" />
              </div>
              <input
                type="file"
                accept="image/*"
                @change="onImageSelect"
                class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 file:cursor-pointer file:border-0 file:bg-slate-300 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-slate-700"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="closeModal" class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Batal
            </button>
            <button type="submit" class="rounded-xl bg-slate-500 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>