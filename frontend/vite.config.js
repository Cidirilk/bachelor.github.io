import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Set base to your GitHub repo name, e.g. '/bachelor_party/'
// Use '/' if deploying to a custom domain or username.github.io root
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
});
