import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import './Login.css';
import RegisterModal from './RegisterModal';
import { useTranslation } from 'react-i18next';

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
		<div className='login-form-container'>
			<div className='login-form'>
				<div className='logo-container'>
					<img
						src={`${process.env.PUBLIC_URL}/images/logo_poleeducation.png`}
						alt='Company Logo'
						className='company-logo'
						width='100'
						height='100'
					/>
				</div>
				<form onSubmit={handleLogin}>
					<label>
						Email:
						<input
							type='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</label>
					<label>
						Password:
						<input
							type='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</label>
					<button type='submit'>{t('button.login')}</button>
					{error && <p className='error-message'>{error}</p>}
				</form>
				<button onClick={openRegisterModal}>
					{t('button.registrationNoun')}
				</button>
			</div>
			{isRegisterModalOpen && (
				<RegisterModal closeModal={closeRegisterModal} />
			)}
		</div>
	);
};

export default Login;
