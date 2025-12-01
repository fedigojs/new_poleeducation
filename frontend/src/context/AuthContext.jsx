import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Добавляем состояние загрузки
    const [sessionId, setSessionId] = useState(null);

    useEffect(() => {
        // Генерируем или восстанавливаем sessionId
        let currentSessionId = localStorage.getItem('judgeSessionId');
        if (!currentSessionId) {
            currentSessionId = crypto.randomUUID();
            localStorage.setItem('judgeSessionId', currentSessionId);
        }
        setSessionId(currentSessionId);

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

        // Генерируем новый sessionId при каждом логине
        const newSessionId = crypto.randomUUID();
        localStorage.setItem('judgeSessionId', newSessionId);
        setSessionId(newSessionId);

        try {
            const decodedUser = jwtDecode(token);
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
        localStorage.removeItem('judgeSessionId');
        setUser(null);
        setSessionId(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, sessionId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
export const useAuth = () => useContext(AuthContext);
