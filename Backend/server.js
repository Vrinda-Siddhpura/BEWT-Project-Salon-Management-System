require('dotenv').config();
const connectDB = require('./src/config/db');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start HTTP server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` Salon Management Backend Server running on port ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Swagger Docs: http://localhost:${PORT}/api-docs`);
    console.log(` MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/salon_management'}`);
    console.log(`==================================================`);
  });
});