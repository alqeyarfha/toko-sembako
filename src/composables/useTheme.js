import { ref, onMounted } from 'vue'

const isDark = ref(false)

export function useTheme() {
  const applyTheme = (dark) => {
    isDark.value = dark
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const toggleTheme = () => {
    applyTheme(!isDark.value)
  }

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      applyTheme(savedTheme === 'dark')
    } else {
      // Mengikuti preferensi sistem / OS jika belum ada settingan tersimpan
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      applyTheme(prefersDark)
    }
  }

  onMounted(() => {
    initTheme()
  })

  return {
    isDark,
    toggleTheme,
    initTheme
  }
}