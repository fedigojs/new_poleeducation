import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true); // Добавляем состояние загрузки

	useEffect(() => {
		const token = localStorage.getItem('authToken');
		if (token) {
			try {
				const decodedUser = jwtDecode(token);

				setUser({
					userId: decodedUser.userId,
					firstName: decodedUser.userFirstName,
					lastName: decodedUser.userLastName,
					roleName: decodedUser.roleName,
				});
			} catch (err) {
				console.error('Ошибка декодирования токена:', err);
			}
		}
		setLoading(false); // Устанавливаем загрузку в false после проверки токена
	}, []);

	const login = (token) => {
		localStorage.setItem('authToken', token);

		try {
			const decodedUser = jwtDecode(token);
			console.log('User decoded from token on login:', decodedUser);
			setUser({
				userId: decodedUser.userId,
				firstName: decodedUser.userFirstName,
				lastName: decodedUser.userLastName,
				roleName: decodedUser.roleName,
			});
		} catch (error) {
			console.error('Failed to decode token', error);
		}
	};

	const logout = () => {
		localStorage.removeItem('authToken');
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, loading, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
