import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import '../auth/Login.css';

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleLogin = async (e) => {
		e.preventDefault();
		try {
			const response = await api.post('/api/auth/login', {
				email,
				password,
			});

			console.log('Login response:', response.data);
			login(response.data.token);
			localStorage.setItem('role', response.data.roleName);
			console.log(
				'Role saved to localStorage:',
				localStorage.getItem('role')
			); // Логирование сохраненной роли
			const role = response.data.roleName;
			if (role === 'Admin') {
				navigate('/admin');
			} else if (role === 'Judge') {
				navigate('/judge');
			}
		} catch (err) {
			setError(err.response?.data.message || 'Произошла ошибка');
			console.error('Login error:', err);
		}
	};

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
					<button type='submit'>Login</button>
					{error && <p className='error-message'>{error}</p>}
				</form>
			</div>
		</div>
	);
};

export default Login;
