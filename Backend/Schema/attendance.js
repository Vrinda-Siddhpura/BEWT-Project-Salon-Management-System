const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    barberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Barbers",
        required: true
    },

    checkIn: {
        type: Date,
        required: true
    },

    checkOut: {
        type: Date
    },

    date: {
        type: Date,
        required: true
    }
})

module.exports = mongoose.model("Attendance", attendanceSchema);