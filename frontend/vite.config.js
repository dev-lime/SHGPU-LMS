import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

export default defineConfig({
	plugins: [react()],
	base: '/',
	resolve: {
		alias: {
			"@src": path.resolve(__dirname, "./src"),
			"@pages": path.resolve(__dirname, "./src/pages"),
			"@components": path.resolve(__dirname, "./src/components"),
			"@utils": path.resolve(__dirname, "./src/utils"),
			"@services": path.resolve(__dirname, "./src/services"),
			"@hooks": path.resolve(__dirname, "./src/hooks"),
			"@context": path.resolve(__dirname, "./src/context")
		}
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('@mui/material') || id.includes('@mui/icons-material')) return 'mui';
					if (id.includes('node_modules/react/')) return 'react';
					if (id.includes('firebase/')) return 'firebase';
				}
			}
		},
		//chunkSizeWarningLimit: 1000,
	}
})
