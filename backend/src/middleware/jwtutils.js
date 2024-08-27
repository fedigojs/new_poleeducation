// utils/jwtUtils.js
const jwt = require('jsonwebtoken');

exports.generateToken = (user) => {
	if (!user || !user.Role || typeof user.Role.name !== 'string') {
		throw new Error('The user object does not have a role with a name');
	}
	return jwt.sign(
		{
			userId: user.id,
			userFirstName: user.firstName,
			userLastName: user.lastName,
			roleId: user.roleId,
			roleName: user.Role.name,
		},
		process.env.JWT_SECRET,
		{ expiresIn: '2h' }
	);
};

exports.generateToken = (user) => {
	const tokenData = {
		userId: user.id,
		userFirstName: user.firstName,
		userLastName: user.lastName,
		roleId: user.roleId,
		roleName: user.Role.name,
	};
	const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
		expiresIn: '2h',
	});

	return token;
};
