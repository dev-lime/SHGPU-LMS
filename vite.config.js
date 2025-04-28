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
