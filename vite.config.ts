import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,        // ✅ Port קבוע
    host: '0.0.0.0',   // ✅ חשוב ל-live reload
    strictPort: true,  // ✅ נכשל אם Port תפוס
    cors: true         // ✅ חשוב לCapacitor
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
        manualChunks: (id) => {
          // ✅ Bundle splitting נכון
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react'
            if (id.includes('@capacitor')) return 'capacitor'
            return 'vendor'
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom'
    ],
    exclude: ['@capacitor/ios'] // ✅ iOS רק בnative
  },
  define: {
    global: 'globalThis'
  }
})
