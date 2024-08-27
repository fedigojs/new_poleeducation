//controllers/athleteAgeController.js
'use strict';

const { AthleteAge } = require('../models');

exports.createAthleteAge = async (req, res) => {
	try {
		const { age } = req.body;
		const newAthleteAge = await AthleteAge.create({ age });
		res.status(200).send(newAthleteAge);
	} catch (error) {
		res.status(400).send(error);
	}
};

exports.getAllAthleteAge = async (req, res) => {
	try {
		const ages = await AthleteAge.findAll();
		res.status(200).send(ages);
	} catch (error) {
		res.status(500).send(error);
	}
};
