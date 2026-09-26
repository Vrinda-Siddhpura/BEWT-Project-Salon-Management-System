const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer reference is required'],
      index: true,
    },
    barberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Barber',
      required: [true, 'Barber reference is required'],
      index: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service reference is required'],
      index: true,
    },
    appointmentDate: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Appointment date is required (YYYY-MM-DD)'],
      index: true,
    },
    startTime: {
      type: String, // Format: HH:mm (24-hour format)
      required: [true, 'Start time is required (HH:mm)'],
    },
    endTime: {
      type: String, // Format: HH:mm (24-hour format)
      required: [true, 'End time is required (HH:mm)'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Compound index for slot scheduling queries and double-booking prevention
appointmentSchema.index({ barberId: 1, appointmentDate: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
