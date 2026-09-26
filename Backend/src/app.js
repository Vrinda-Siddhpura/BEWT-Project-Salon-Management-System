const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const setupSwagger = require('./docs/swagger');
const errorMiddleware = require('./middlewares/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const barberRoutes = require('./routes/barberRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const wageRoutes = require('./routes/wageRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Security and utility middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Swagger API Documentation
setupSwagger(app);

// Root & Health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Salon Management System API Service is running',
    documentation: 'http://localhost:5000/api-docs',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Healthy' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/wages', wageRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Handle 404 Not Found
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    error: 'NOT_FOUND',
  });
});

// Global Error Handler
app.use(errorMiddleware);

module.exports = app;
