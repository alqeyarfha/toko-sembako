<script setup>
import { useTheme } from '../composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <button
    @click="toggleTheme"
    type="button"
    class="relative inline-flex h-9 w-16 items-center rounded-full p-1 transition-colors duration-300 focus:outline-none shadow-inner"
    :class="isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'"
    :title="isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'"
  >
    <!-- Ikon & Bulatan Geluncur -->
    <span
      class="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md transform transition-transform duration-300 text-sm"
      :class="isDark ? 'translate-x-7 bg-slate-900 text-amber-400' : 'translate-x-0 bg-white text-slate-700'"
    >
      <span v-if="isDark">🌙</span>
      <span v-else>☀️</span>
    </span>
  </button>
</template>