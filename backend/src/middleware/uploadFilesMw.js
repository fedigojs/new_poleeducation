// uploadFilesMw.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const { competitionId, athleteId } = req.body;

		if (!competitionId || !athleteId) {
			return cb(new Error('Missing competitionId or athleteId'));
		}

		const folderPath = path.join(
			__dirname,
			'../uploads',
			`competition_${competitionId}`,
			`athlete_${athleteId}`
		);

		fs.mkdirSync(folderPath, { recursive: true });
		cb(null, folderPath);
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}_${file.originalname}`);
	},
});

const uploadFilesMw = multer({ storage });

module.exports = uploadFilesMw;
