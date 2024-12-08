const { Competition } = require('../models');

exports.createCompetition = async (req, res) => {
	const { title, date_open, date_close, location } = req.body;
	try {
		const competition = await Competition.create({
			title,
			date_open,
			date_close,
			location,
			display: true,
		});
		return res.status(201).json(competition);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

exports.getAllCompetitions = async (req, res) => {
	// const { title, date_open, date_close, location } = req.body;
	try {
		const competitions = await Competition.findAll();
		return res.status(200).json(competitions);
	} catch (error) {
		return res.status(400).json(competitions);
	}
};

exports.getCompetition = async (req, res) => {
	const { id } = req.params;
	try {
		const competition = await Competition.findByPk(id);
		if (!competition) {
			return res.status(404).json({ error: error.message });
		}
		return res.status(200).json(competition);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

exports.updateCompetition = async (req, res) => {
	const { id } = req.params;
	const { title, date_open, date_close, location, display } = req.body;
	try {
		const competition = await Competition.findByPk(id);
		if (!competition) {
			return res.status(404).json({ error: error.message });
		}
		await competition.update({
			title,
			date_open,
			date_close,
			location,
			display,
		});
		return res.status(200).json(competition);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

exports.deleteCompetition = async (req, res) => {
	const { id } = req.params;
	try {
		const competition = await Competition.findByPk(id);
		if (!competition) {
			return res.status(404).json({ error: error.message });
		}
		await competition.destroy();
		return res.status(200).json(competition);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};
