const express = require('express');
const router = express.Router();
const barberController = require('../controllers/barberController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validateMiddleware = require('../middlewares/validateMiddleware');
const { createBarberSchema, updateBarberSchema } = require('../validations/barberValidation');

router.use(authMiddleware);

router.get('/', barberController.getBarbers);
router.get('/:id', barberController.getBarberById);
router.post('/', roleMiddleware(['Administrator']), validateMiddleware(createBarberSchema), barberController.createBarber);
router.put('/:id', roleMiddleware(['Administrator']), validateMiddleware(updateBarberSchema), barberController.updateBarber);
router.delete('/:id', roleMiddleware(['Administrator']), barberController.deleteBarber);

module.exports = router;
