const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(['Administrator']));

router.get('/daily-revenue', reportController.getDailyRevenue);
router.get('/monthly-revenue', reportController.getMonthlyRevenue);
router.get('/top-services', reportController.getTopServices);
router.get('/barber-performance', reportController.getBarberPerformance);
router.get('/customer-visits', reportController.getCustomerVisits);

module.exports = router;
