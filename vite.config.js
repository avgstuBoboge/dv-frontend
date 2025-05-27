import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    base: '/com-480-project-Ficciones/',
    build: {
        target: 'esnext'
    }
})
