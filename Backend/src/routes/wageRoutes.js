const express = require('express');
const router = express.Router();
const wageController = require('../controllers/wageController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validateMiddleware = require('../middlewares/validateMiddleware');
const { generateWageSchema } = require('../validations/wageValidation');

router.use(authMiddleware);

router.get('/', wageController.getWages);
router.post('/', roleMiddleware(['Administrator']), validateMiddleware(generateWageSchema), wageController.generateWageRecord);

module.exports = router;
