import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';
import './i18n';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.scss';

function App() {
	return (
		<div>
			<AuthProvider>
				<AppRoutes />
			</AuthProvider>
		</div>
	);
}

export default App;
