const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validateMiddleware = require('../middlewares/validateMiddleware');
const { serviceSchema } = require('../validations/serviceValidation');

router.use(authMiddleware);

router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getServiceById);
router.post('/', roleMiddleware(['Administrator']), validateMiddleware(serviceSchema), serviceController.createService);
router.put('/:id', roleMiddleware(['Administrator']), validateMiddleware(serviceSchema), serviceController.updateService);
router.delete('/:id', roleMiddleware(['Administrator']), serviceController.deleteService);

module.exports = router;
