import React from 'react';
import { Outlet } from 'react-router-dom';
import Menu from '../../components/Menu/Menu';

const JudgePage = () => {
	const menuItems = [
		{ path: '/judge/athletes-judgement', label: 'Змагання' },
	];

	return (
		<>
			<Menu
				menuItems={menuItems}
				brandLink='/judge'
			/>
			<div className='content'>
				<Outlet />
			</div>
		</>
	);
};

export default JudgePage;
