require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();
const { sequelize } = require('./src/models');
const cors = require('cors');
const morgan = require('morgan');

// Import routes
const usersRoute = require('./src/routes/usersRoute');
const athletesRoute = require('./src/routes/athletesRoute');
const athleteAgeRoute = require('./src/routes/athleteAgeRoute');
const athleteTrendRoute = require('./src/routes/athleteTrendRoute');
const competitionRoute = require('./src/routes/competitionRoute');
const competitionPartRoute = require('./src/routes/compParticipationRoute');
const disciplineRoute = require('./src/routes/disciplineRoute');
const exerciseRoute = require('./src/routes/exerciseRoute');
const levelRoute = require('./src/routes/levelRoute');
const protocolRoute = require('./src/routes/protocolRoute');
const protocolDetailsRoute = require('./src/routes/protocolDetailsRoute');
const roleRoute = require('./src/routes/roleRoute');
const scoreRoute = require('./src/routes/scoreRoute');
const authRoute = require('./src/routes/authRoute');
const adminRoute = require('./src/routes/adminRoute');
const detailExerciseRoute = require('./src/routes/detailExerciseRoute');
const drawResultsRoute = require('./src/routes/drawResultRoute');
const protocolElementResultRoute = require('./src/routes/protocolElementResultRoute');
const protocolExerciseResultRoute = require('./src/routes/protocolExerciseResultRoute');
const judgementRoute = require('./src/routes/n1/judgementRoute');

// Sync database
sequelize
	.sync({ force: false }) // Note: { force: true } drops existing tables and recreates them
	.then(() => {
		console.log('Database synchronized');
	})
	.catch((error) => {
		console.error('Error synchronizing database:', error);
	});

// Middleware
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Для разбора JSON-запросов
const corsOptions = {
	origin: process.env.CORS_ORIGIN,
	optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Static files for uploads with setHeaders
const uploadDir = path.join(__dirname, 'upload_files');
app.use(
	'/backend/upload_files',
	express.static(uploadDir, {
		setHeaders: (res, filePath) => {
			const extension = path.extname(filePath).toLowerCase();
			switch (extension) {
				case '.mp3':
					res.setHeader('Content-Type', 'audio/mpeg');
					break;
				case '.jpg':
				case '.jpeg':
					res.setHeader('Content-Type', 'image/jpeg');
					break;
				case '.png':
					res.setHeader('Content-Type', 'image/png');
					break;
				case '.mp4':
					res.setHeader('Content-Type', 'video/mp4');
					break;
				default:
					// Не меняем Content-Type для других файлов
					break;
			}
		},
	})
);

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

// API routes
app.use('/api/users', usersRoute);
app.use('/api/athletes', athletesRoute);
app.use('/api/athletes-age', athleteAgeRoute);
app.use('/api/athletes-trend', athleteTrendRoute);
app.use('/api/competition', competitionRoute);
app.use('/api/comp-part', competitionPartRoute);
app.use('/api/discipline', disciplineRoute);
app.use('/api/exercise', exerciseRoute);
app.use('/api/exercise-details', detailExerciseRoute);
app.use('/api/level', levelRoute);
app.use('/api/protocol', protocolRoute);
app.use('/api/protocol-details', protocolDetailsRoute);
app.use('/api/protocol-result', protocolElementResultRoute);
app.use('/api/protocol-exercise-result', protocolExerciseResultRoute);
app.use('/api/role', roleRoute);
app.use('/api/score', scoreRoute);
app.use('/api/auth', authRoute);
app.use('/api/admin', adminRoute);
app.use('/api/draw-result', drawResultsRoute);
app.use('/api/draw-judgement', judgementRoute);

// Start server
const PORT = process.env.PORT_BACKEND;
const HOST = process.env.HOST_BACKEND;
app.listen(PORT, HOST, () => {
	console.log(`Server is running on http://${HOST}:${PORT}`);
});
