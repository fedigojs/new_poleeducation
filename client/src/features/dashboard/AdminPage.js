// AdminPage.js
import { useAuth } from '../../context/AuthContext'; // Убедитесь, что путь верный
import { Outlet } from 'react-router-dom';
import './AdminPage.css'; // Предполагается, что стили вынесены в отдельный файл
import Sidebar from '../../components/adminpanel/Sidebar';

const AdminPage = () => {
	const { logout } = useAuth();

	return (
		<>
			<div className='header'>
				<div className='logo'>Админ-панель</div>
				<button
					className='logout-btn'
					onClick={logout}>
					Logout
				</button>
			</div>

			<Sidebar />

			<div className='content'>
				<Outlet />
			</div>
		</>
	);
};

export default AdminPage;
