import React from 'react';
import { Outlet } from 'react-router-dom';
import Menu from '../../components/Menu/Menu';

const AdminPage = () => {
	const menuItems = [
		{ path: '/admin/add-user', label: 'Додати користувача' },
		{ path: '/admin/add-athletes', label: 'Додати спортсмена' },
		{ path: '/admin/add-competition', label: 'Створити змагання' },
		{
			path: '/admin/register-athletes',
			label: 'Реєстрація на змаганнях',
		},
		{
			path: '/admin/athletes-draw',
			label: 'Timings',
		},
		{
			path: '/admin/athletes-judgement',
			label: 'Judgement',
		},
	];

	return (
		<>
			<Menu
				menuItems={menuItems}
				brandLink='/admin'
			/>
			<div className='content'>
				<Outlet />
			</div>
		</>
	);
};

export default AdminPage;
