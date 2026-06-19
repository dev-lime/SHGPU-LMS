import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from "path";

export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['LMS.svg'],
			manifest: {
				name: 'SHGPU LMS',
				short_name: 'SHGPU',
				description: 'Неофициальное приложение ШГПУ',
				theme_color: '#4CAF50',
				background_color: '#FFFBFE',
				display: 'standalone',
				orientation: 'portrait',
				icons: [
					{ src: 'LMS.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' }
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,svg}'],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/shspu\.ru\/sch_api\/.*/i,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'schedule-api',
							expiration: { maxEntries: 10, maxAgeSeconds: 7 * 24 * 60 * 60 },
							networkTimeoutSeconds: 5
						}
					}
				]
			}
		})
	],
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
