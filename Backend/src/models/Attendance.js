const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    barberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Barber',
      required: [true, 'Barber reference is required'],
      index: true,
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in time is required'],
    },
    checkOut: {
      type: Date,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Attendance date is required (YYYY-MM-DD)'],
      index: true,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ barberId: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
