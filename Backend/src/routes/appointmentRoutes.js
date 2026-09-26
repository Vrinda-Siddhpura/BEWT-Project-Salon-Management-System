const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validateMiddleware = require('../middlewares/validateMiddleware');
const { appointmentSchema } = require('../validations/appointmentValidation');

router.use(authMiddleware);

router.get('/', appointmentController.getAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.post('/', roleMiddleware(['Administrator', 'Receptionist']), validateMiddleware(appointmentSchema), appointmentController.createAppointment);
router.put('/:id', roleMiddleware(['Administrator', 'Receptionist', 'Barber']), appointmentController.updateAppointment);
router.delete('/:id', roleMiddleware(['Administrator', 'Receptionist']), appointmentController.deleteAppointment);

module.exports = router;
