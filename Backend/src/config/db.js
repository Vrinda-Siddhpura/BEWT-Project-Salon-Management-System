const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let connStr = process.env.MONGODB_URI;

    if (!connStr) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          'MONGODB_URI environment variable is not defined. Please configure MONGODB_URI in your Render Environment Variables.'
        );
      }
      connStr = 'mongodb://127.0.0.1:27017/salon_management';
    }

    // Clean any accidental whitespace or wrapping quotes from copy-pasting
    connStr = connStr.trim();
    if (
      (connStr.startsWith('"') && connStr.endsWith('"')) ||
      (connStr.startsWith("'") && connStr.endsWith("'"))
    ) {
      connStr = connStr.slice(1, -1).trim();
    }

    // Guard against unreplaced placeholders (e.g. <username>, <password>, <cluster>)
    if (/<[^>]+>/.test(connStr)) {
      throw new Error(
        'MONGODB_URI contains unreplaced placeholder brackets (e.g., <cluster>, <username>, or <password>). ' +
        'In Render Dashboard -> Environment, replace the placeholders with your actual MongoDB Atlas credentials and cluster domain.'
      );
    }

    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
