import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
=======
  base: '/admin/',
>>>>>>> 6cc616dc60455c07b2af7a510f047e08cd923378
});