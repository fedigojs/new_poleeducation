import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import './Header.scss';
import '../index.scss';

const Header = ({ className = '' }) => {
	const location = useLocation();
	return (
		<Navbar
			className={`p-4 font_montserrat_menu ${className}`}
			expand='lg'>
			<Container>
				<Navbar.Brand
					as={Link}
					to='/'>
					<img
						src='/images/logo_poleeducation.png'
						alt='PoleEducation'
						width='200px'
						className='d-inline-block align-top'
					/>
				</Navbar.Brand>
				<Navbar.Toggle aria-controls='basic-navbar-nav' />
				<Navbar.Collapse id='basic-navbar-nav'>
					<Nav className='ms-auto'>
						<Nav.Link
							as={Link}
							to='/'
							className={`text-white ${
								location.pathname === '/' ? 'active' : ''
							}`}>
							Головна
						</Nav.Link>
						<Nav.Link
							as={Link}
							to='#'
							className={`text-white ${
								location.pathname === '#' ? 'active' : ''
							}`}>
							Змагання
						</Nav.Link>
						<Nav.Link
							as={Link}
							to='/test-elements'
							className={`text-white ${
								location.pathname === '/test-elements'
									? 'active'
									: ''
							}`}>
							Обовʼязкові елементи
						</Nav.Link>
						<Nav.Link
							as={Link}
							to='#'
							className={`text-white ${
								location.pathname === '#' ? 'active' : ''
							}`}>
							Правила
						</Nav.Link>
						<Nav.Link
							as={Link}
							to='#'
							className={`text-white ${
								location.pathname === '#' ? 'active' : ''
							}`}>
							Події
						</Nav.Link>
						<Nav.Link
							as={Link}
							to='#'
							className={`text-white ${
								location.pathname === '#' ? 'active' : ''
							}`}>
							Контакти
						</Nav.Link>
						<Button
							as={Link}
							to='/login'
							variant='light'
							className={`ms-3 font_montserrat_menu`}>
							Log In
						</Button>
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
};

export default Header;
