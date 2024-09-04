import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
	return (
		<footer className='bg-black text-white py-4 mt-auto'>
			<Container>
				<Row>
					<Col md={4}>
						<h5>POLEEducation</h5>
						<p>© 2024 All Rights Reserved.</p>
					</Col>
					<Col md={4}>
						<ul className='list-unstyled'>
							<li>
								<a
									href='#'
									className='text-white'>
									Обовʼязкові елементи
								</a>
							</li>
							<li>
								<a
									href='#'
									className='text-white'>
									Правила
								</a>
							</li>
							<li>
								<a
									href='#'
									className='text-white'>
									Контакти
								</a>
							</li>
						</ul>
					</Col>
					<Col md={4}>
						<h5>Contact Us</h5>
						<p>Email: info@poleeducation.com</p>
						<p>Phone: +380 000 000 00 00</p>
					</Col>
				</Row>
			</Container>
		</footer>
	);
};

export default Footer;
