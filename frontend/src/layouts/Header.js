import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';

const Header = () => {
	return (
		<Navbar
			bg='dark'
			variant='dark'
			expand='lg'
			collapseOnSelect
			className='w-100'>
			<Container>
				<Navbar.Brand
					as={Link}
					to='/'
					className='text-white'>
					<img
						src='/images/logo_poleeducation.png'
						alt='PoleEducation'
						width='40'
						height='40'
						className='d-inline-block align-top'
					/>{' '}
					POLEEducation
				</Navbar.Brand>
				<Navbar.Toggle aria-controls='basic-navbar-nav' />
				<Navbar.Collapse id='basic-navbar-nav'>
					<Nav className='ms-auto'>
						<Nav.Link
							as={Link}
							to='#'
							className='text-white'>
							Змагання
						</Nav.Link>
						<Nav.Link
							as={Link}
							to='/test-elements'
							className='text-white'>
							Обовʼязкові елементи
						</Nav.Link>
						<Nav.Link
							as={Link}
							to='#'
							className='text-white'>
							Правила
						</Nav.Link>
						<Nav.Link
							as={Link}
							to='#'
							className='text-white'>
							Події
						</Nav.Link>
						<Nav.Link
							as={Link}
							to='#'
							className='text-white'>
							Контакти
						</Nav.Link>
						<Nav.Link
							as={Link}
							to='/login'
							className='bg-white text-black py-2 px-4 rounded'>
							Log In
						</Nav.Link>
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
};

export default Header;
