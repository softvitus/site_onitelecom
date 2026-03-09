import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Usar oxc para transformação de JSX (não esbuild)
      fastRefresh: true,
    }),
  ],
  build: {
    // Usar minificador padrão do Vite (esbuild)
    minify: 'esbuild',
    // Code splitting para reduzir tamanho de chunks
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['ag-grid-react', 'ag-grid-community', 'bootstrap'],
          'vendor-icons': ['react-icons'],
          'vendor-forms': ['react-hook-form', 'react-dropzone'],
          'vendor-utils': ['axios', 'date-fns', 'lodash'],
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          'vendor-maps': ['leaflet', 'react-leaflet'],
          'vendor-other': ['react-hot-toast', 'sweetalert2', 'react-color', 'react-router-dom'],
        },
      },
    },
    // Aumentar limite de aviso de chunk (agora temos chunks menores)
    chunkSizeWarningLimit: 600,
  },
  // Otimizações de servidor
  server: {
    port: 5173,
    strictPort: false,
    open: false,
  },
  // Preview para teste local
  preview: {
    port: 5173,
  },
});
