import './App.css';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';
import './i18n';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
	return (
		<div className='App'>
			<AuthProvider>
				<AppRoutes />
			</AuthProvider>
		</div>
	);
}

export default App;
