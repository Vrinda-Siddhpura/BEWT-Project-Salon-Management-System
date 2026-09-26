const mongoose = require("mongoose");

const wageRecordsSchema = new mongoose.Schema({
    barberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Barbers",
        required: true
    },

    month: {
        type: String,
        required: true
    },

    salary: {
        type: Number,
        default: 0
    },

    commission: {
        type: Number,
        default: 0
    },

    deductions: {
        type: Number,
        default: 0
    },

    total_amount: {
        type: Number,
        required: true
    },

    payment_status: {
        type: String,
        enum: ["Pending", "Paid"],
        default: "Pending"
    },

    payment_date: {
        type: Date
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Wage_Records", wageRecordsSchema);