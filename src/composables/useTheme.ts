import { ref, onMounted } from 'vue'

const theme = ref<'light' | 'dark'>('light')

export function useTheme() {
    const setTheme = (mode: 'light' | 'dark') => {
        theme.value = mode

        const html = document.documentElement

        if (mode === 'dark') {
            html.classList.add('dark')
        } else {
            html.classList.remove('dark')
        }

        localStorage.setItem('theme', mode)
    }

    const toggleTheme = () => {
        setTheme(theme.value === 'dark' ? 'light' : 'dark')
    }

    onMounted(() => {
        const saved = localStorage.getItem('theme') as 'light' | 'dark'

        if (saved) {
            setTheme(saved)
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            setTheme(prefersDark ? 'dark' : 'light')
        }
    })

    return {
        theme,
        toggleTheme,
    }
}