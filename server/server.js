require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();
const { sequelize } = require('./models');
const cors = require('cors');
const morgan = require('morgan');

// Import routes
const usersRoute = require('./routes/usersRoute');
const athletesRoute = require('./routes/athletesRoute');
const athleteAgeRoute = require('./routes/athleteAgeRoute');
const athleteTrendRoute = require('./routes/athleteTrendRoute');
const competitionRoute = require('./routes/competitionRoute');
const competitionPartRoute = require('./routes/compParticipationRoute');
const disciplineRoute = require('./routes/disciplineRoute');
const exerciseRoute = require('./routes/exerciseRoute');
const levelRoute = require('./routes/levelRoute');
const protocolRoute = require('./routes/protocolRoute');
const protocolDetailsRoute = require('./routes/protocolDetailsRoute');
const roleRoute = require('./routes/roleRoute');
const scoreRoute = require('./routes/scoreRoute');
const authRoute = require('./routes/authRoute');
const adminRoute = require('./routes/adminRoute');
const detailExerciseRoute = require('./routes/detailExerciseRoute');
const drawResultsRoute = require('./routes/drawResultRoute');
const protocolElementResultRoute = require('./routes/protocolElementResultRoute');

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
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Для разбора JSON-запросов
const corsOptions = {
	origin: 'http://localhost:3000', // Разрешает ваш домен
	optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

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
app.use('/api/role', roleRoute);
app.use('/api/score', scoreRoute);
app.use('/api/auth', authRoute);
app.use('/api/admin', adminRoute);
app.use('/api/draw-result', drawResultsRoute);

// // Serve static files from the React app's build folder
// app.use(express.static(path.join(__dirname, 'build')));

// // Serve index.html for all other routes to support client-side routing
// app.get('*', (req, res) => {
// 	res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
