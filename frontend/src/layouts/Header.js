import React from 'react';
import { Link } from 'react-router-dom';

import './Header.css';

const Header = () => {
	return (
		<header className='header'>
			<div
				style={{
					display: 'inline-flex',
					alignItems: 'center',
				}}>
				<img
					src='/images/logo_poleeducation.png'
					alt='PoleEducation'
					className='logo-img'
					width='40'
					height='40'
				/>
				<Link
					to='/'
					className='nav-logo'>
					POLEEducation
				</Link>
			</div>
			<nav className='nav-links'>
				<Link
					to='#'
					className='nav-item'>
					Змагання
				</Link>
				<Link
					to='#'
					className='nav-item'>
					Навчання
				</Link>
				<Link
					to='#'
					className='nav-item'>
					Правила
				</Link>
				<Link
					to='#'
					className='nav-item'>
					Події
				</Link>
				<Link
					to='#'
					className='nav-item'>
					Контакти
				</Link>
				<Link
					to='/login'
					className='button button-log-in'>
					Log In
				</Link>
			</nav>
		</header>
	);
};

export default Header;
