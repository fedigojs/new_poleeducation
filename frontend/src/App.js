import './App.css';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';

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
