<script setup>
import { ref, onMounted } from 'vue'

const user = ref({
  name: '',
  email: '',
  role: '',
  no_hp: '',
  alamat: ''
})

onMounted(() => {
  user.value = JSON.parse(localStorage.getItem('user') || '{}')
})
</script>

<template>
  <div class="max-w-2xl mx-auto bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <h2 class="text-xl font-bold text-slate-800 mb-6">Profil Saya</h2>

    <div class="space-y-4 text-sm">
      <div class="grid grid-cols-3 py-2 border-b border-slate-100">
        <span class="text-slate-500 font-medium">Nama</span>
        <span class="col-span-2 font-bold text-slate-800">{{ user.name || '-' }}</span>
      </div>
      <div class="grid grid-cols-3 py-2 border-b border-slate-100">
        <span class="text-slate-500 font-medium">Email</span>
        <span class="col-span-2 text-slate-800">{{ user.email || '-' }}</span>
      </div>
      <div class="grid grid-cols-3 py-2 border-b border-slate-100">
        <span class="text-slate-500 font-medium">Role</span>
        <span class="col-span-2 capitalize font-semibold text-slate-700">{{ user.role || 'pembeli' }}</span>
      </div>
      <div class="grid grid-cols-3 py-2 border-b border-slate-100">
        <span class="text-slate-500 font-medium">No. Telepon</span>
        <span class="col-span-2 text-slate-800">{{ user.no_hp || '-' }}</span>
      </div>
      <div class="grid grid-cols-3 py-2 border-b border-slate-100">
        <span class="text-slate-500 font-medium">Alamat</span>
        <span class="col-span-2 text-slate-800">{{ user.alamat || '-' }}</span>
      </div>
    </div>
  </div>
</template>