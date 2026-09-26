const mongoose = require('mongoose');

const barberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    commissionPercentage: {
      type: Number,
      required: [true, 'Commission percentage is required'],
      min: [0, 'Commission cannot be less than 0%'],
      max: [100, 'Commission cannot exceed 100%'],
      default: 40,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Barber', barberSchema);
