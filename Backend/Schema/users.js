const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum:["Administrator","Receptionist","Barber"],
        default: "Barber"
    },

    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    }
},
{
    timestamps: { createdAt: "created_at", updatedAt: false }
})

module.exports = mongoose.model("Users", usersSchema);