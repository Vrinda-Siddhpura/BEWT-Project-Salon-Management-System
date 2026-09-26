const express = require("express");
const router = express.Router();
const Barber = require("../Schema/barbers");
const User = require("../Schema/users");
const authMiddleware = require("../Middleware/authMiddleware");
const roleMiddleware = require("../Middleware/roleMiddleware");

router.use(authMiddleware);

// getAllBarbers
router.get("/", roleMiddleware("Administrator", "Receptionist", "Barber"), async (req, res) => {
    try {
        const barbers = await Barber.find().populate("userId", "-password");
        res.status(200).json(barbers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// getBarberById
router.get("/:id", roleMiddleware("Administrator", "Receptionist", "Barber"), async (req, res) => {
    try {
        const barber = await Barber.findById(req.params.id).populate("userId", "-password");

        if (!barber) {
            return res.status(404).json({ message: "Barber not found!" });
        }

        res.status(200).json(barber);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// addBarber
router.post("/", roleMiddleware("Administrator", "Receptionist"), async (req, res) => {
    try {
        const { userId, specialization, commission_percentage, joining_date, workingStart, workingEnd } = req.body;

        if (!userId || commission_percentage === undefined || !joining_date || !workingStart || !workingEnd) {
            return res.status(400).json({
                message: "Missing required barber fields: userId, commission_percentage, joining_date, workingStart, workingEnd!"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Referenced User not found!" });
        }

        const existingBarber = await Barber.findOne({ userId });
        if (existingBarber) {
            return res.status(409).json({ message: "Barber profile already exists for this User!" });
        }

        const barber = await Barber.create({
            userId,
            specialization,
            commission_percentage,
            joining_date,
            workingStart,
            workingEnd
        });

        res.status(201).json({
            message: "Barber added successfully",
            barber
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// updateBarber
router.put("/:id", roleMiddleware("Administrator", "Receptionist"), async (req, res) => {
    try {
        const barber = await Barber.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate("userId", "-password");

        if (!barber) {
            return res.status(404).json({ message: "Barber not found!" });
        }

        res.status(200).json({
            message: "Barber updated successfully",
            barber
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// deleteBarber
router.delete("/:id", roleMiddleware("Administrator", "Receptionist"), async (req, res) => {
    try {
        const barber = await Barber.findByIdAndDelete(req.params.id);

        if (!barber) {
            return res.status(404).json({ message: "Barber not found!" });
        }

        res.status(200).json({
            message: "Barber deleted successfully",
            barber
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;