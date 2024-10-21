import React from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
	const { user, loading } = useAuth();

	if (loading) {
		return <div>Loading...</div>; // Можно заменить на компонент-загрузчик
	}

	if (!user) {
		console.log('ProtectedRoute: no user, redirecting to login');
		return <Navigate to='/login' />;
	}

	return children;
};
ProtectedRoute.propTypes = {
	children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
