const express = require("express");
const router = express.Router();
const Slot = require("../Schema/slots");
const Barber = require("../Schema/barbers");
const Holiday = require("../Schema/holidays");
const authMiddleware = require("../Middleware/authMiddleware");
const roleMiddleware = require("../Middleware/roleMiddleware");

router.use(authMiddleware);

// GetAllSlots
router.get("/", roleMiddleware("Administrator", "Receptionist", "Barber"), async (req, res) => {
    try {
        let filter = {};

        if (req.user.role === "Barber") {
            const barber = await Barber.findOne({ userId: req.user.id });
            if (barber) {
                filter.barberId = barber._id;
            } else {
                return res.status(200).json([]);
            }
        }

        const slots = await Slot.find(filter).populate({
            path: "barberId",
            populate: { path: "userId", select: "name email" }
        });

        res.status(200).json(slots);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GetSlotById
router.get("/:id", roleMiddleware("Administrator", "Receptionist", "Barber"), async (req, res) => {
    try {
        const slot = await Slot.findById(req.params.id).populate({
            path: "barberId",
            populate: { path: "userId", select: "name email" }
        });

        if (!slot) {
            return res.status(404).json({ message: "Slot not found!" });
        }

        if (req.user.role === "Barber") {
            const barber = await Barber.findOne({ userId: req.user.id });
            if (!barber || slot.barberId._id.toString() !== barber._id.toString()) {
                return res.status(403).json({ message: "Access Denied!" });
            }
        }

        res.status(200).json(slot);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// AddSlot
router.post("/", roleMiddleware("Administrator", "Receptionist"), async (req, res) => {
    try {
        const { barberId, date, startTime, endTime, status } = req.body;

        if (!barberId || !date || !startTime || !endTime) {
            return res.status(400).json({
                message: "Missing required slot fields: barberId, date, startTime, endTime!"
            });
        }

        const barber = await Barber.findById(barberId);
        if (!barber) {
            return res.status(404).json({ message: "Barber not found!" });
        }

        const parsedDate = new Date(date);
        const startOfDay = new Date(parsedDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(parsedDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const holiday = await Holiday.findOne({
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (holiday) {
            return res.status(400).json({
                message: `Cannot create slot on holiday! Reason: ${holiday.reason || "Holiday"}`
            });
        }

        if (startTime < barber.workingStart || endTime > barber.workingEnd) {
            return res.status(400).json({
                message: `Slot (${startTime} - ${endTime}) is outside barber working hours (${barber.workingStart} - ${barber.workingEnd})!`
            });
        }

        const existingSlot = await Slot.findOne({
            barberId,
            date: { $gte: startOfDay, $lte: endOfDay },
            status: { $ne: "Blocked" },
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
        });

        if (existingSlot) {
            return res.status(409).json({
                message: "Slot already booked or conflicts with an existing slot!"
            });
        }

        const slot = await Slot.create({
            barberId,
            date: parsedDate,
            startTime,
            endTime,
            status: status || "Available"
        });

        res.status(201).json({
            message: "Slot added successfully",
            slot
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UpdateSlot
router.put("/:id", roleMiddleware("Administrator", "Receptionist"), async (req, res) => {
    try {
        const slot = await Slot.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!slot) {
            return res.status(404).json({ message: "Slot not found!" });
        }

        res.status(200).json({
            message: "Slot updated successfully",
            slot
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DeleteSlot
router.delete("/:id", roleMiddleware("Administrator", "Receptionist"), async (req, res) => {
    try {
        const slot = await Slot.findByIdAndDelete(req.params.id);

        if (!slot) {
            return res.status(404).json({ message: "Slot not found!" });
        }

        res.status(200).json({
            message: "Slot deleted successfully",
            slot
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;