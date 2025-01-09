import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import path from 'path'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd())

    return {
        plugins: [
            vue(),
            vuetify({
                autoImport: true,
                styles: true,
            }),
        ],
        server: {
            host: '0.0.0.0',
            proxy: {
                '/api': {
                    target: env.VITE_API_URL || 'http://backend:3000',
                    changeOrigin: true,
                    // rewrite: (path) => path.replace(/^\/api/, ''),
                },
            },
            watch: {
                usePolling: true,
            },
            hmr: {
                // protocol: 'ws',
                host: 'localhost',
                clientPort: 5173,
            },
        },
        resolve: {
            alias: {
                '@assets': path.resolve(__dirname, 'src/assets'),
                '@components': path.resolve(__dirname, 'src/components'),
                '@scss': path.resolve(__dirname, 'src/scss'),
                '@plugins': path.resolve(__dirname, 'src/plugins'),
                '@router': path.resolve(__dirname, 'src/router'),
                '@stores': path.resolve(__dirname, 'src/stores'),
                '@types': path.resolve(__dirname, 'src/types'),
                '@utils': path.resolve(__dirname, 'src/utils'),
                '@views': path.resolve(__dirname, 'src/views'),
                '@demo': path.resolve(__dirname, 'src/demo'),
            },
        },
        base: env.VITE_BASE_URL || '/',
    }
})
