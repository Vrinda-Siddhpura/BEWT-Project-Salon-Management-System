const mongoose = require("mongoose");

const shiftsSchema = new mongoose.Schema({
    barberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Barbers",
        required: true
    },

    shiftDate: {
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
        enum: ["Scheduled", "Completed", "Cancelled"],
        default: "Scheduled"
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Shifts", shiftsSchema);
