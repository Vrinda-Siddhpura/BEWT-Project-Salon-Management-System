const mongoose = require('mongoose');

const wageRecordSchema = new mongoose.Schema(
  {
    barberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Barber',
      required: [true, 'Barber reference is required'],
      index: true,
    },
    month: {
      type: String, // Format: YYYY-MM
      required: [true, 'Month is required (YYYY-MM)'],
      index: true,
    },
    salary: {
      type: Number,
      required: [true, 'Base salary is required'],
      default: 0,
    },
    commission: {
      type: Number,
      required: [true, 'Commission amount is required'],
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      default: 0,
    },
  },
  { timestamps: true }
);

wageRecordSchema.index({ barberId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('WageRecord', wageRecordSchema);
