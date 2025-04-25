import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

export default defineConfig({
	plugins: [react()],
	base: '/',
	resolve: {
		alias: {
			"@pages": path.resolve(__dirname, "./src/pages"),
			"@components": path.resolve(__dirname, "./src/components"),
			"@context": path.resolve(__dirname, "./src/context")
		}
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {
						if (id.includes('firebase')) return 'vendor-firebase';
						if (id.includes('react')) return 'vendor-react';
						if (id.includes('@mui')) return 'vendor-mui';
						return 'vendor';
					}
				}
			}
		}
	}
})
