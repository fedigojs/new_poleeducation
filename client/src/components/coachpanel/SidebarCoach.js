// Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../adminpanel/Sidebar.css';

const SidebarCoach = () => {
	return (
		<div className='sidebar'>
			<h2>Меню</h2>
			<ul className='menu-list'>
				<li>
					<Link to='/coach'>Головна</Link>
				</li>
				<li>
					<Link to='/coach/add-athletes'>
						Зареэструвати спортсмена
					</Link>
				</li>
				<li>
					<Link to='/coach/athletes-competitions'>Змагання</Link>
				</li>
			</ul>
		</div>
	);
};

export default SidebarCoach;
