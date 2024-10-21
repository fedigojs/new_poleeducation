import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import api from '../../api/api';
import PropTypes from 'prop-types';

const RegisterModal = ({ show, closeModal }) => {
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
	const [role, setRole] = useState('');
	const [isRegistrationDisabled, setIsRegistrationDisabled] = useState(false);

	useEffect(() => {
		evaluatePasswordStrength(password);
	}, [password]);

	useEffect(() => {
		if (role === 'athlete') {
			setError(t('Реєстрацію має право проходити лише ТРЕНЕР!'));
			setIsRegistrationDisabled(true);
		} else {
			setError('');
			setIsRegistrationDisabled(false);
		}
	}, [role]);

	const evaluatePasswordStrength = (password) => {
		let strength = '';
		if (password.length >= 8) {
			if (
				/[a-z]/.test(password) &&
				/[A-Z]/.test(password) &&
				/\d/.test(password) &&
				/[!@#$%^&*]/.test(password)
			) {
				strength = t('strength.good');
			} else if (/[a-zA-Z]/.test(password) && /\d/.test(password)) {
				strength = t('strength.medium');
			} else {
				strength = t('strength.weak');
			}
		} else {
			strength = t('strength.tooWeak');
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
			setError(t('error.phoneLength'));
			return;
		}

		if (password !== confirmPassword) {
			setError(t('error.passwordMismatch'));
			return;
		}

		try {
			const existingUser = await api.post('/api/auth/check-email', {
				email,
			});
			if (existingUser.data.exists) {
				setError(t('error.emailExists'));
				return;
			}

			await api.post('/api/auth/register', {
				firstName,
				lastName,
				phoneNumber,
				email,
				password,
			});

			setSuccess(t('success.registration'));
			setError('');
			closeModal();
		} catch (err) {
			setError(err.response?.data.message || t('error.generic'));
		}
	};

	return (
		<Modal
			show={show}
			onHide={closeModal}
			centered>
			<Modal.Header closeButton>
				<Modal.Title>{t('button.registrationNoun')}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form onSubmit={handleRegister}>
					<Form.Group
						className='mb-3'
						controlId='formRole'>
						<Form.Label>{t('label.role')}</Form.Label>
						<Form.Control
							as='select'
							value={role}
							onChange={(e) => setRole(e.target.value)}
							required>
							<option value=''>{t('select.chooseRole')}</option>
							<option value='athlete'>
								{t('select.athlete')}
							</option>
							<option value='coach'>{t('select.coach')}</option>
						</Form.Control>
					</Form.Group>

					<Form.Group
						className='mb-3'
						controlId='formFirstName'>
						<Form.Label>{t('label.firstName')}</Form.Label>
						<Form.Control
							type='text'
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
							required
						/>
					</Form.Group>
					<Form.Group
						className='mb-3'
						controlId='formLastName'>
						<Form.Label>{t('label.lastName')}</Form.Label>
						<Form.Control
							type='text'
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
							required
						/>
					</Form.Group>
					<Form.Group
						className='mb-3'
						controlId='formPhoneNumber'>
						<Form.Label>{t('label.phoneText')}</Form.Label>
						<Form.Control
							type='text'
							value={phoneNumber}
							onChange={handlePhoneNumberChange}
							required
						/>
					</Form.Group>
					<Form.Group
						className='mb-3'
						controlId='formEmail'>
						<Form.Label>{t('label.email')}</Form.Label>
						<Form.Control
							type='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</Form.Group>
					<Form.Group
						className='mb-3'
						controlId='formPassword'>
						<Form.Label>{t('label.password')}</Form.Label>
						<Form.Control
							type='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</Form.Group>
					<p className='password-strength'>
						{t('label.passwordStrength')}: {passwordStrength}
					</p>
					<Form.Group
						className='mb-3'
						controlId='formConfirmPassword'>
						<Form.Label>{t('label.passwordConfirm')}</Form.Label>
						<Form.Control
							type='password'
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
						/>
					</Form.Group>
					<Button
						variant='primary'
						type='submit'
						className='w-100'
						disabled={isRegistrationDisabled}>
						{t('button.registrationVerb')}
					</Button>
				</Form>
				{error && (
					<Alert
						variant='danger'
						className='mt-3'>
						{error}
					</Alert>
				)}
				{success && (
					<Alert
						variant='success'
						className='mt-3'>
						{success}
					</Alert>
				)}
			</Modal.Body>
		</Modal>
	);
};
RegisterModal.propTypes = {
	show: PropTypes.bool.isRequired,
	closeModal: PropTypes.func.isRequired,
};

export default RegisterModal;
