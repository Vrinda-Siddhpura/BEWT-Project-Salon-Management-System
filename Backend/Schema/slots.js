const mongoose = require("mongoose");

const slotsSchema = new mongoose.Schema({
    barberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Barbers",
        required: true
    },

    date: {
        type: Date,
        required: true
    },

    startTime: {
        type: String,
        required: true
    },

    endTime: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["Available", "Booked", "Blocked"],
        default: "Available"
    }
});

module.exports = mongoose.model("Slots", slotsSchema);