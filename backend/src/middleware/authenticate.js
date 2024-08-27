//src/middleware/authenticate.js

const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res
			.status(401)
			.send({ message: 'Заголовок авторризации обязателен' });
	}
	const token = authHeader.split(' ')[1];
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		next();
	} catch (error) {
		return res.status(403).send({ message: 'Неверный токен' });
	}
};

// Middleware для проверки роли пользователя
const authorizeRoles = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.roleId)) {
			return res.status(403).json({
				message: 'You do not have permission to perform this action',
			});
		}
		next();
	};
};

module.exports = {
	authenticate,
	authorizeRoles,
};
