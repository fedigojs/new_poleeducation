import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	// Загружаем env переменные
	const env = loadEnv(mode, process.cwd(), '');

	return {
		plugins: [
			react(),
			svgr({
				// svgr options: https://react-svgr.com/docs/options/
				svgrOptions: {
					exportType: 'default',
					ref: true,
					svgo: false,
					titleProp: true,
				},
				include: '**/*.svg',
			}),
		],

		// Настройка путей (алиасы как в CRA)
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src'),
			},
		},

		// Dev server настройки
		server: {
			port: 3000,
			open: true,
			// Proxy для API (как в CRA proxy)
			proxy: {
				'/api': {
					target: env.VITE_API_URL || 'http://localhost:3002',
					changeOrigin: true,
					secure: false,
				},
			},
		},

		// Production build настройки
		build: {
			outDir: 'build',
			sourcemap: false,
			// Для совместимости со старыми браузерами
			target: 'es2015',
			// Чанки для оптимизации загрузки
			rollupOptions: {
				output: {
					manualChunks: {
						'vendor-react': ['react', 'react-dom', 'react-router-dom'],
						'vendor-antd': ['antd'],
						'vendor-query': ['@tanstack/react-query'],
						'vendor-i18n': ['i18next', 'react-i18next'],
					},
				},
			},
			// Увеличиваем лимит для warning
			chunkSizeWarningLimit: 1000,
		},

		// Замена process.env для совместимости с CRA кодом
		define: {
			'process.env': {},
			global: 'globalThis',
		},

		// Оптимизация
		optimizeDeps: {
			include: ['react', 'react-dom', 'react-router-dom', 'antd'],
		},
	};
});
