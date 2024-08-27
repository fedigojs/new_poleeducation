const express = require('express');
const router = express.Router();

const athleteTrendController = require('../controllers/athleteTrendController');

router.post('/', athleteTrendController.createAthleteTrend);
router.get('/', athleteTrendController.getAllAthleteTrend);
router.get('/protocols/:trendId', athleteTrendController.getTrendWithProtocols);

module.exports = router;
