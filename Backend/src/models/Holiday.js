const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema(
  {
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Holiday date is required (YYYY-MM-DD)'],
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Holiday name is required'],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Holiday', holidaySchema);
