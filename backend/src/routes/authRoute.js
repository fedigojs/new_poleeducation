//routes/authRoute.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google-login', authController.login_with_google);
router.post('/check-email', authController.checkEmail);

module.exports = router;
