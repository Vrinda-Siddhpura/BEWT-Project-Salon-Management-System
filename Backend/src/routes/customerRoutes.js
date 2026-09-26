const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validateMiddleware = require('../middlewares/validateMiddleware');
const { customerSchema } = require('../validations/customerValidation');

router.use(authMiddleware);

router.get('/', roleMiddleware(['Administrator', 'Receptionist']), customerController.getCustomers);
router.get('/:id', roleMiddleware(['Administrator', 'Receptionist']), customerController.getCustomerById);
router.post('/', roleMiddleware(['Administrator', 'Receptionist']), validateMiddleware(customerSchema), customerController.createCustomer);
router.put('/:id', roleMiddleware(['Administrator', 'Receptionist']), validateMiddleware(customerSchema), customerController.updateCustomer);
router.delete('/:id', roleMiddleware(['Administrator']), customerController.deleteCustomer);

module.exports = router;
