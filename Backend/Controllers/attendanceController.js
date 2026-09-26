const express = require("express");
const router = express.Router();
const Attendance = require("../Schema/attendance");
const Barber = require("../Schema/barbers");
const Shift = require("../Schema/shifts");
const authMiddleware = require("../Middleware/authMiddleware");
const roleMiddleware = require("../Middleware/roleMiddleware");

router.use(authMiddleware);

// GET all attendance
router.get("/", roleMiddleware("Administrator", "Receptionist", "Barber"), async (req, res) => {
    try {
        let filter = {};

        // If user is a Barber, restrict to their own attendance
        if (req.user.role === "Barber") {
            const barber = await Barber.findOne({ userId: req.user.id });
            if (barber) {
                filter.barberId = barber._id;
            } else {
                return res.status(200).json([]);
            }
        }

        const attendance = await Attendance.find(filter).populate({
            path: "barberId",
            populate: { path: "userId", select: "name email role" }
        });

        res.status(200).json(attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET attendance by ID
router.get("/:id", roleMiddleware("Administrator", "Receptionist", "Barber"), async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id).populate({
            path: "barberId",
            populate: { path: "userId", select: "name email role" }
        });

        if (!attendance) {
            return res.status(404).json({ message: "Attendance record not found!" });
        }

        if (req.user.role === "Barber") {
            const barber = await Barber.findOne({ userId: req.user.id });
            if (!barber || attendance.barberId._id.toString() !== barber._id.toString()) {
                return res.status(403).json({ message: "Access Denied!" });
            }
        }

        res.status(200).json(attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST add attendance (Check-In)
router.post("/", roleMiddleware("Administrator", "Receptionist", "Barber"), async (req, res) => {
    try {
        let { barberId, checkIn, checkOut, date } = req.body;

        // If logged in as Barber, ensure barberId matches their own profile
        if (req.user.role === "Barber") {
            const barberProfile = await Barber.findOne({ userId: req.user.id });
            if (!barberProfile) {
                return res.status(404).json({ message: "Barber profile not found for this user!" });
            }
            barberId = barberProfile._id;
        }

        if (!barberId) {
            return res.status(400).json({ message: "barberId is required!" });
        }

        // Barber existence check
        const barber = await Barber.findById(barberId);
        if (!barber) {
            return res.status(404).json({ message: "Barber not found!" });
        }

        const attendanceDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(attendanceDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(attendanceDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        // Prevent duplicate attendance for the same barber on the same date
        const existingAttendance = await Attendance.findOne({
            barberId,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (existingAttendance) {
            return res.status(409).json({
                message: "Attendance record already exists for this barber on this date!"
            });
        }

        // Check-in and check-out time validation
        const checkInTime = checkIn ? new Date(checkIn) : new Date();
        let checkOutTime = null;

        if (checkOut) {
            checkOutTime = new Date(checkOut);
            if (checkOutTime <= checkInTime) {
                return res.status(400).json({
                    message: "Check-out time cannot be before or equal to check-in time!"
                });
            }
        }

        // Optional Shift verification warning/log if shifts are assigned
        const assignedShift = await Shift.findOne({
            barberId,
            shiftDate: { $gte: startOfDay, $lte: endOfDay },
            status: "Scheduled"
        });

        const attendance = await Attendance.create({
            barberId,
            date: startOfDay,
            checkIn: checkInTime,
            checkOut: checkOutTime
        });

        res.status(201).json({
            message: "Attendance recorded successfully",
            shiftVerified: !!assignedShift,
            attendance
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT update attendance (e.g. Check-Out)
router.put("/:id", roleMiddleware("Administrator", "Receptionist", "Barber"), async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id);
        if (!attendance) {
            return res.status(404).json({ message: "Attendance record not found!" });
        }

        if (req.user.role === "Barber") {
            const barberProfile = await Barber.findOne({ userId: req.user.id });
            if (!barberProfile || attendance.barberId.toString() !== barberProfile._id.toString()) {
                return res.status(403).json({ message: "Access Denied!" });
            }
        }

        const checkInTime = req.body.checkIn ? new Date(req.body.checkIn) : attendance.checkIn;
        const checkOutTime = req.body.checkOut ? new Date(req.body.checkOut) : attendance.checkOut;

        if (checkInTime && checkOutTime && new Date(checkOutTime) <= new Date(checkInTime)) {
            return res.status(400).json({
                message: "Check-out time cannot be before or equal to check-in time!"
            });
        }

        const updatedAttendance = await Attendance.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: "Attendance updated successfully",
            attendance: updatedAttendance
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE attendance
router.delete("/:id", roleMiddleware("Administrator", "Receptionist"), async (req, res) => {
    try {
        const attendance = await Attendance.findByIdAndDelete(req.params.id);

        if (!attendance) {
            return res.status(404).json({ message: "Attendance record not found!" });
        }

        res.status(200).json({
            message: "Attendance deleted successfully",
            attendance
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;