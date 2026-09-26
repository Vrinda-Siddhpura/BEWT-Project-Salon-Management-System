const mongoose = require("mongoose");

const servicesSchema = new mongoose.Schema({
    service_name: {
        type: String,
        required: true
    },

    duration: {
        type: Number,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    description: {
        type: String,
    }
})

module.exports = mongoose.model("Services", servicesSchema);