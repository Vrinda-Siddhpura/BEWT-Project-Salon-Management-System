const express = require("express");
const router = express.Router();
const Shift = require("../Schema/shifts");
const Barber = require("../Schema/barbers");
const Holiday = require("../Schema/holidays");
const authMiddleware = require("../Middleware/authMiddleware");
const roleMiddleware = require("../Middleware/roleMiddleware");

router.use(authMiddleware);

// Helper to normalize date to start of day for comparison
const normalizeDate = (d) => {
    const date = new Date(d);
    date.setUTCHours(0, 0, 0, 0);
    return date;
};

// GET all shifts
router.get("/", roleMiddleware("Administrator", "Receptionist", "Barber"), async (req, res) => {
    try {
        let filter = {};
        
        // If logged-in user is a Barber, restrict query to their own shifts unless barberId is specified
        if (req.user.role === "Barber") {
            const barber = await Barber.findOne({ userId: req.user.id });
            if (barber) {
                filter.barberId = barber._id;
            } else {
                return res.status(200).json([]);
            }
        }

        const shifts = await Shift.find(filter).populate({
            path: "barberId",
            populate: { path: "userId", select: "name email role" }
        });

        res.status(200).json(shifts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET shift by ID
router.get("/:id", roleMiddleware("Administrator", "Receptionist", "Barber"), async (req, res) => {
    try {
        const shift = await Shift.findById(req.params.id).populate({
            path: "barberId",
            populate: { path: "userId", select: "name email role" }
        });

        if (!shift) {
            return res.status(404).json({ message: "Shift not found!" });
        }

        // Barber can only view their own shift
        if (req.user.role === "Barber") {
            const barber = await Barber.findOne({ userId: req.user.id });
            if (!barber || shift.barberId._id.toString() !== barber._id.toString()) {
                return res.status(403).json({ message: "Access Denied!" });
            }
        }

        res.status(200).json(shift);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST shift
router.post("/", roleMiddleware("Administrator", "Receptionist"), async (req, res) => {
    try {
        const { barberId, shiftDate, startTime, endTime, status } = req.body;

        if (!barberId || !shiftDate || !startTime || !endTime) {
            return res.status(400).json({ message: "Missing required shift fields!" });
        }

        // Barber existence check
        const barber = await Barber.findById(barberId);
        if (!barber) {
            return res.status(404).json({ message: "Barber not found!" });
        }

        // Time range validation
        if (startTime >= endTime) {
            return res.status(400).json({ message: "startTime must be before endTime!" });
        }

        // Holiday check
        const parsedShiftDate = new Date(shiftDate);
        const startOfDay = new Date(parsedShiftDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(parsedShiftDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const holiday = await Holiday.findOne({
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (holiday) {
            return res.status(400).json({
                message: `Cannot schedule shift on holiday! Reason: ${holiday.reason || "Holiday"}`
            });
        }

        // Duplicate/Conflicting shift check for the same barber on the same date
        const existingShift = await Shift.findOne({
            barberId,
            shiftDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $ne: "Cancelled" },
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
            ]
        });

        if (existingShift) {
            return res.status(409).json({
                message: "Conflicting shift already exists for this barber on the selected date!"
            });
        }

        const shift = await Shift.create({
            barberId,
            shiftDate: parsedShiftDate,
            startTime,
            endTime,
            status: status || "Scheduled"
        });

        res.status(201).json({
            message: "Shift created successfully",
            shift
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT shift
router.put("/:id", roleMiddleware("Administrator", "Receptionist"), async (req, res) => {
    try {
        const { barberId, shiftDate, startTime, endTime, status } = req.body;

        const currentShift = await Shift.findById(req.params.id);
        if (!currentShift) {
            return res.status(404).json({ message: "Shift not found!" });
        }

        const targetBarberId = barberId || currentShift.barberId;
        const targetShiftDate = shiftDate ? new Date(shiftDate) : currentShift.shiftDate;
        const targetStartTime = startTime || currentShift.startTime;
        const targetEndTime = endTime || currentShift.endTime;

        if (targetStartTime >= targetEndTime) {
            return res.status(400).json({ message: "startTime must be before endTime!" });
        }

        // Check barber
        const barber = await Barber.findById(targetBarberId);
        if (!barber) {
            return res.status(404).json({ message: "Barber not found!" });
        }

        // Check holiday
        const startOfDay = new Date(targetShiftDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(targetShiftDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const holiday = await Holiday.findOne({
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (holiday) {
            return res.status(400).json({
                message: `Cannot update shift to a holiday! Reason: ${holiday.reason || "Holiday"}`
            });
        }

        // Check conflict with other shifts
        const conflictingShift = await Shift.findOne({
            _id: { $ne: req.params.id },
            barberId: targetBarberId,
            shiftDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $ne: "Cancelled" },
            startTime: { $lt: targetEndTime },
            endTime: { $gt: targetStartTime }
        });

        if (conflictingShift) {
            return res.status(409).json({
                message: "Conflicting shift exists for this barber on the selected date!"
            });
        }

        const updatedShift = await Shift.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: "Shift updated successfully",
            shift: updatedShift
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE shift
router.delete("/:id", roleMiddleware("Administrator", "Receptionist"), async (req, res) => {
    try {
        const shift = await Shift.findByIdAndDelete(req.params.id);

        if (!shift) {
            return res.status(404).json({ message: "Shift not found!" });
        }

        res.status(200).json({
            message: "Shift deleted successfully",
            shift
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
