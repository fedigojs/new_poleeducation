const path = require('path');

// Определяем окружение
const env = process.env.NODE_ENV || 'development';

// Загружаем правильный .env файл в зависимости от окружения
if (env === 'production') {
	require('dotenv').config({ path: path.resolve(__dirname, '../../.env.production') });
} else {
	require('dotenv').config({ path: path.resolve(__dirname, '../../.env.development') });
}

const config = {
	development: {
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		dialect: process.env.DB_DIALECT,
		pool: {
			max: 10,
			min: 0,
			acquire: 30000,
			idle: 10000
		}
	},
	test: {
		username: "root",
		password: null,
		database: "database_test",
		host: "127.0.0.1",
		dialect: "mysql"
	},
	production: {
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		dialect: process.env.DB_DIALECT,
		pool: {
			max: 10,
			min: 0,
			acquire: 30000,
			idle: 10000
		}
	}
};

console.log('DB Config loaded:', config[env]);

module.exports = config;
