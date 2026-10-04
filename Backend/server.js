require('dotenv').config();
const connectDB = require('./src/config/db');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Connect to MongoDB and start HTTP server
connectDB()
  .then(() => {
    app.listen(PORT, HOST, () => {
      console.log(`==================================================`);
      console.log(` Salon Management Backend Server running on port ${PORT}`);
      console.log(` Host: ${HOST}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Swagger Docs: /api-docs`);
      console.log(` Health Check: /health`);
      console.log(`==================================================`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });