<script setup>
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'

const route = useRoute()
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Sembunyikan Navbar jika sedang di halaman login -->
    <Navbar v-if="route.path !== '/login'" />

    <!-- Area Konten Utama -->
    <main class="max-w-7xl mx-auto py-6 px-4">
      <router-view />
    </main>
  </div>
</template>