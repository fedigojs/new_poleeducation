// uploadFilesMw.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const { competitionId, athleteId, athleteTrendId } = req.body;

		if (!competitionId || !athleteId) {
			return cb(new Error('Missing competitionId or athleteId'));
		}

		const folderPath = path.join(
			__dirname,
			'../../upload_files',
			`competition_${competitionId}`,
			`athlete_${athleteId}`,
			`athlete_trends_${athleteTrendId}`
		);

		fs.mkdirSync(folderPath, { recursive: true });
		cb(null, folderPath);
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}_${file.originalname}`);
	},
});

const uploadFilesMw = multer({
	storage,
	limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
}).fields([{ name: 'files', maxCount: 5 }]);

module.exports = uploadFilesMw;
