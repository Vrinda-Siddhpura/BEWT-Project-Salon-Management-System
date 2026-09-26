const mongoose = require("mongoose");

const holidaysSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },

    reason: {
        type: String
    }
});

module.exports = mongoose.model("Holidays", holidaysSchema);