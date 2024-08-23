import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import '../auth/Login.css';
import './RegisterModal.css';

const RegisterModal = ({ closeModal }) => {
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [passwordStrength, setPasswordStrength] = useState('');

	useEffect(() => {
		evaluatePasswordStrength(password);
	}, [password]);

	const evaluatePasswordStrength = (password) => {
		let strength = '';
		if (password.length >= 8) {
			if (
				/[a-z]/.test(password) &&
				/[A-Z]/.test(password) &&
				/\d/.test(password) &&
				/[!@#$%^&*]/.test(password)
			) {
				strength = 'Хороший';
			} else if (/[a-zA-Z]/.test(password) && /\d/.test(password)) {
				strength = 'Середній';
			} else {
				strength = 'Слабкий';
			}
		} else {
			strength = 'За слабкий';
		}
		setPasswordStrength(strength);
	};

	const handleRegister = async (e) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			setError('Паролі не однакові');
			return;
		}

		try {
			// Проверка на наличие пользователя с таким email
			const existingUser = await api.post('/api/auth/check-email', {
				email,
			});
			if (existingUser.data.exists) {
				setError('Email вже використовується');
				return;
			}

			// Регистрация пользователя
			const response = await api.post('/api/auth/register', {
				firstName,
				lastName,
				email,
				password,
			});

			setSuccess('Registration successful! Please login.');
			setError('');
			closeModal(); // Закрыть модальное окно после успешной регистрации
		} catch (err) {
			setError(err.response?.data.message || 'An error occurred');
		}
	};

	return (
		<div className='modal2'>
			<div className='modal-content2'>
				<span
					className='close'
					onClick={closeModal}>
					&times;
				</span>
				<h2>Регистрація</h2>
				<form onSubmit={handleRegister}>
					<label>
						Імʼя
						<input
							type='text'
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
							required
						/>
					</label>
					<label>
						Прізвищє
						<input
							type='text'
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
							required
						/>
					</label>
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
					<p className='password-strength'>
						Password Strength: {passwordStrength}
					</p>
					<label>
						Confirm Password:
						<input
							type='password'
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
						/>
					</label>
					<button type='submit'>Регистрація</button>
					{error && <p className='error-message'>{error}</p>}
					{success && <p className='success-message'>{success}</p>}
				</form>
			</div>
		</div>
	);
};

export default RegisterModal;
