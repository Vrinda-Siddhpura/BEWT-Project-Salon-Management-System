const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const validateMiddleware = require('../middlewares/validateMiddleware');
const { loginSchema, changePasswordSchema } = require('../validations/authValidation');

router.post('/login', validateMiddleware(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.getMe);
router.put('/change-password', authMiddleware, validateMiddleware(changePasswordSchema), authController.changePassword);

module.exports = router;
