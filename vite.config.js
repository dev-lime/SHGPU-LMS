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
				manualChunks: {
					mui: ['@mui/material', '@mui/icons-material'],
					firebase: ['firebase/firestore', 'firebase/auth', 'firebase/storage'],
					react: ['react', 'react-dom', 'react-router-dom']
				}
			}
		},
		//chunkSizeWarningLimit: 1000,
	}
})
