// Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';

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
						Реєстрація на змаганнях
					</Link>
				</li>
				<li>
					<Link to='/admin/athletes-draw'>Змагання</Link>
				</li>
				<li>
					<Link to='/admin/athletes-draw-new'>NEW COMPETITIONS</Link>
				</li>
			</ul>
		</div>
	);
};

export default Sidebar;
