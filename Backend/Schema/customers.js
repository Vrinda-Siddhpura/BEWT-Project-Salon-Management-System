const mongoose = require("mongoose");

const customersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    email: {
        type: String
    },

    gender: {
        type: String,
        enum: ["Male", "Female", "Other"]
    }
},
{
    timestamps: { createdAt: "created_at", updatedAt: false }
})

module.exports = mongoose.model("Customers", customersSchema);