import axios from 'axios';

const API_URL = 'http://poleeducation.in.ua';

const api = axios.create({
	baseURL: API_URL,
	headers: {
		'Custom-Header': 'value', // Убедитесь, что этот заголовок действительно вам нужен
	},
});
export const setAuthToken = (token) => {
	api.defaults.headers.common['Authorization'] = token
		? `Bearer ${token}`
		: '';
};

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Обработка ошибок аутентификации
			console.error('Not authorized, token expired or invalid');
			// Дополнительная логика по обработке ошибок аутентификации
		}
		return Promise.reject(error);
	}
);

// Установка интерсептора запроса только для экземпляра api, а не глобально для axios
api.interceptors.request.use((request) => {
	const token = localStorage.getItem('authToken'); // Получение токена из хранилища
	request.headers['Authorization'] = token ? `Bearer ${token}` : '';
	return request;
});

export default api;
