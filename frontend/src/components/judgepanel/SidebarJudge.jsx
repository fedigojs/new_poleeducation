// Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../adminpanel/Sidebar.css';

const SidebarJudge = () => {
	return (
		<div className='sidebar'>
			<h2>Меню</h2>
			<ul className='menu-list'>
				<li>
					<Link to='/judge'>Головна</Link>
				</li>
				<li>
					<Link to='/judge/athletes-draw'>Змагання</Link>
				</li>
			</ul>
		</div>
	);
};

export default SidebarJudge;
