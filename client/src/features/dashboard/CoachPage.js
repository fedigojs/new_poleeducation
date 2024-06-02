// AdminPage.js
import { useAuth } from '../../context/AuthContext'; // Убедитесь, что путь верный
import { Outlet } from 'react-router-dom';
import './AdminPage.css'; // Предполагается, что стили вынесены в отдельный файл
import SidebarCoach from '../../components/coachpanel/SidebarCoach';

const CoachPage = () => {
	const { logout } = useAuth();

	return (
		<>
			<div className='header'>
				<div className='logo'>Адмін-панель</div>
				<button
					className='logout-btn'
					onClick={logout}>
					Logout
				</button>
			</div>

			<SidebarCoach />

			<div className='content'>
				<Outlet />
			</div>
		</>
	);
};

export default CoachPage;
