import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    host: true,
    cors: true,
    strictPort: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          capacitor: ['@capacitor/core', '@capacitor/app']
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      '@capacitor/core', 
      '@capacitor/filesystem',
      '@capacitor/app',
      '@capacitor/keyboard',
      '@capacitor/status-bar'
    ]
  },
  define: {
    global: 'globalThis'
  }
})
