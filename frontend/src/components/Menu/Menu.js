import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { AuthContext } from '../../context/AuthContext';

const Menu = ({ menuItems, brandLink }) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { logout } = useAuth();
	const { user } = useContext(AuthContext);

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	return (
		<Navbar
			bg='dark'
			variant='dark'
			expand='lg'
			expanded={isMenuOpen}>
			<Container>
				<Navbar.Brand
					as={Link}
					to={brandLink}
					className='text-white'>
					POLEEducation {user.roleName}
				</Navbar.Brand>

				<Navbar.Toggle
					aria-controls='basic-navbar-nav'
					onClick={toggleMenu}
				/>

				<Navbar.Collapse id='basic-navbar-nav'>
					<Nav className='ml-auto d-flex align-items-center'>
						{menuItems.map((item, index) => (
							<Nav.Link
								as={Link}
								to={item.path}
								key={index}>
								{item.label}
							</Nav.Link>
						))}
						<Button
							variant='danger'
							onClick={logout}
							className='ml-5'>
							Logout
						</Button>
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
};

export default Menu;
