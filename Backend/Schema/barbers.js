const mongoose = require("mongoose");

const barbersSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    specialization: {
        type: String
    },

    commission_percentage: {
        type: Number,
        required: true
    },

    joining_date: {
        type: Date,
        required: true
    },

    workingStart: {
        type: String,
        required: true
    },

    workingEnd: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Barbers", barbersSchema);