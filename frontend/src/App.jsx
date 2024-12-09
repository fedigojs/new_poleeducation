import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';
import './i18n';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.scss';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();
function App() {
	return (
		<div>
			{' '}
			<QueryClientProvider client={queryClient}>
				<AuthProvider>
					<AppRoutes />
				</AuthProvider>
			</QueryClientProvider>
		</div>
	);
}

export default App;
