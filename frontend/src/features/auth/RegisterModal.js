import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import './Login.css';
import './RegisterModal.css';
import { useTranslation } from 'react-i18next';

const RegisterModal = ({ closeModal }) => {
	const { t } = useTranslation();
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('+38');
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

	const handlePhoneNumberChange = (e) => {
		const input = e.target.value;
		if (input.startsWith('+38') && input.length <= 13) {
			setPhoneNumber(input);
		}
	};

	const handleRegister = async (e) => {
		e.preventDefault();

		const digitsOnly = phoneNumber.replace(/\D/g, '');
		if (digitsOnly.length !== 12) {
			setError(
				'Номер телефону повинен містити 12 цифр, включаючи код країни'
			);
			return;
		}

		if (password !== confirmPassword) {
			setError('Паролі не однакові');
			return;
		}

		try {
			const existingUser = await api.post('/api/auth/check-email', {
				email,
			});
			if (existingUser.data.exists) {
				setError('Email вже використовується');
				return;
			}

			const response = await api.post('/api/auth/register', {
				firstName,
				lastName,
				phoneNumber,
				email,
				password,
			});

			alert('Реєстрація успішна! Будь ласка, увійдіть.');
			setError('');
			closeModal();
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
				<h2>{t('button.registrationNoun')}</h2>
				<form onSubmit={handleRegister}>
					<label>
						{t('label.firstName')}
						<input
							type='text'
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
							required
						/>
					</label>
					<label>
						{t('label.lastName')}
						<input
							type='text'
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
							required
						/>
					</label>
					<label>
						{t('label.phoneText')}:
						<input
							type='text'
							value={phoneNumber}
							onChange={handlePhoneNumberChange}
							required
						/>
					</label>
					<label>
						{t('label.email')}:
						<input
							type='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</label>
					<label>
						{t('label.password')}:
						<input
							type='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</label>
					<p className='password-strength'>
						{t('label.passwordStrength')}: {passwordStrength}
					</p>
					<label>
						{t('label.passwordConfirm')}:
						<input
							type='password'
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
						/>
					</label>
					<button type='submit'>
						{t('button.registrationVerb')}
					</button>
					{error && <p className='error-message'>{error}</p>}
					{success && <p className='success-message'>{success}</p>}
				</form>
			</div>
		</div>
	);
};

export default RegisterModal;
