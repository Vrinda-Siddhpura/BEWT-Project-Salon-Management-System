const express = require("express");
const router = express.Router();
const Holiday = require("../Schema/holidays");
const authMiddleware = require("../Middleware/authMiddleware");
const roleMiddleware = require("../Middleware/roleMiddleware");

router.use(authMiddleware);

// GetAllHolidays
router.get("/", roleMiddleware("Administrator", "Receptionist", "Barber"), async (req, res) => {
    try {
        const holidays = await Holiday.find();
        res.status(200).json(holidays);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GetHolidayById
router.get("/:id", roleMiddleware("Administrator", "Receptionist", "Barber"), async (req, res) => {
    try {
        const holiday = await Holiday.findById(req.params.id);

        if (!holiday) {
            return res.status(404).json({ message: "Holiday not found!" });
        }

        res.status(200).json(holiday);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// AddHoliday
router.post("/", roleMiddleware("Administrator", "Receptionist"), async (req, res) => {
    try {
        const { date, reason } = req.body;

        if (!date) {
            return res.status(400).json({ message: "Holiday date is required!" });
        }

        const holiday = await Holiday.create({ date, reason });

        res.status(201).json({
            message: "Holiday added successfully",
            holiday
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "Holiday already exists on this date!" });
        }
        res.status(500).json({ message: err.message });
    }
});

// UpdateHoliday
router.put("/:id", roleMiddleware("Administrator", "Receptionist"), async (req, res) => {
    try {
        const holiday = await Holiday.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!holiday) {
            return res.status(404).json({ message: "Holiday not found!" });
        }

        res.status(200).json({
            message: "Holiday updated successfully",
            holiday
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DeleteHoliday
router.delete("/:id", roleMiddleware("Administrator", "Receptionist"), async (req, res) => {
    try {
        const holiday = await Holiday.findByIdAndDelete(req.params.id);

        if (!holiday) {
            return res.status(404).json({ message: "Holiday not found!" });
        }

        res.status(200).json({
            message: "Holiday deleted successfully",
            holiday
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;