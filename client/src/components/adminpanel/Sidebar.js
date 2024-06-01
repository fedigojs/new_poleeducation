// Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../adminpanel/Sidebar.css';

const Sidebar = () => {
	return (
		<div className='sidebar'>
			<h2>Меню</h2>
			<ul className='menu-list'>
				<li>
					<Link to='/admin'>Головна</Link>
				</li>
				<li>
					<Link to='/admin/add-user'>Додати користувача</Link>
				</li>
				<li>
					<Link to='/admin/add-athletes'>Додати спортсмена</Link>
				</li>
				<li>
					<Link to='/admin/add-competition'>Створити змагання</Link>
				</li>
				<li>
					<Link to='/admin/register-athletes'>
						Зареєструвати спротсмена на змаганнях
					</Link>
				</li>
				<li>
					<Link to='/admin/athletes-draw'>Змагання</Link>
				</li>
			</ul>
		</div>
	);
};

export default Sidebar;
