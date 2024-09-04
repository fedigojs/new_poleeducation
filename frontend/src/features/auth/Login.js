import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import { useTranslation } from 'react-i18next';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import RegisterModal from './RegisterModal';

const Login = () => {
	const { t } = useTranslation();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();
	const { login } = useAuth();
	const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

	const handleLogin = async (e) => {
		e.preventDefault();
		try {
			const response = await api.post('/api/auth/login', {
				email,
				password,
			});

			login(response.data.token);
			localStorage.setItem('role', response.data.roleName);
			const role = response.data.roleName;
			if (role === 'Admin') {
				navigate('/admin');
			} else if (role === 'Judge') {
				navigate('/judge');
			} else if (role === 'Coach') {
				navigate('/coach');
			}
		} catch (err) {
			setError(err.response?.data.message || 'An error has occurred');
			console.error('Login error:', err);
		}
	};

	const openRegisterModal = () => setIsRegisterModalOpen(true);
	const closeRegisterModal = () => setIsRegisterModalOpen(false);

	return (
		<Container className='d-flex justify-content-center align-items-center min-vh-100'>
			<Row className='w-100'>
				<Col
					xs={12}
					md={6}
					lg={4}
					className='mx-auto'>
					<div className='text-center mb-4'>
						<img
							src={`${process.env.PUBLIC_URL}/images/logo_poleeducation.png`}
							alt='Company Logo'
							width='100'
							height='100'
							className='mb-3'
						/>
					</div>
					<Form onSubmit={handleLogin}>
						<Form.Group
							controlId='formEmail'
							className='mb-3'>
							<Form.Label>Email</Form.Label>
							<Form.Control
								type='email'
								placeholder='Enter email'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</Form.Group>

						<Form.Group
							controlId='formPassword'
							className='mb-3'>
							<Form.Label>Password</Form.Label>
							<Form.Control
								type='password'
								placeholder='Enter password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</Form.Group>

						<Button
							variant='primary'
							type='submit'
							className='w-100'>
							{t('button.login')}
						</Button>
					</Form>

					{error && (
						<Alert
							variant='danger'
							className='mt-3'>
							{error}
						</Alert>
					)}

					<div className='text-center mt-4'>
						<Button
							variant='link'
							onClick={openRegisterModal}>
							{t('button.registrationNoun')}
						</Button>
					</div>
				</Col>
			</Row>

			{/* Modal for Registration */}
			<RegisterModal
				show={isRegisterModalOpen}
				closeModal={closeRegisterModal}
				centered></RegisterModal>
		</Container>
	);
};

export default Login;
