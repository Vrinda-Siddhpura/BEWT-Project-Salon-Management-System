const mongoose = require("mongoose");

const appointmentsSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customers",
        required: true
    },

    barberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Barbers",
        required: true
    },

    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Services",
        required: true
    },

    appointment_date: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: ["Pending", "Confirmed", "In Progress", "Completed", "Cancelled"], 
        default: "Pending"
    },

    remarks: {
        type: String
    }
})

module.exports = mongoose.model("Appointments", appointmentsSchema);