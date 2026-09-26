const express = require("express");
const router = express.Router();
const WageRecord = require("../Schema/wage_records");
const Barber = require("../Schema/barbers");
const Appointment = require("../Schema/appointments");
const authMiddleware = require("../Middleware/authMiddleware");
const roleMiddleware = require("../Middleware/roleMiddleware");

router.use(authMiddleware);

// Helper function to calculate barber commission from completed appointments
const calculateBarberCommission = async (barberId, startPeriod, endPeriod) => {
    const barber = await Barber.findById(barberId);
    if (!barber) {
        throw new Error("Barber not found!");
    }

    const commissionRate = barber.commission_percentage || 0;

    const query = {
        barberId,
        status: "Completed"
    };

    if (startPeriod && endPeriod) {
        query.appointment_date = { $gte: new Date(startPeriod), $lte: new Date(endPeriod) };
    }

    const completedAppointments = await Appointment.find(query).populate("serviceId");

    let totalCommission = 0;
    let completedCount = 0;

    for (const appt of completedAppointments) {
        if (appt.serviceId && typeof appt.serviceId.price === "number") {
            totalCommission += appt.serviceId.price * (commissionRate / 100);
            completedCount++;
        }
    }

    return { totalCommission, completedCount, commissionRate };
};

// GET all wage records
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

        const wageRecords = await WageRecord.find(filter).populate({
            path: "barberId",
            populate: { path: "userId", select: "name email role" }
        });

        res.status(200).json(wageRecords);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET wage record by ID
router.get("/:id", roleMiddleware("Administrator", "Receptionist", "Barber"), async (req, res) => {
    try {
        const wageRecord = await WageRecord.findById(req.params.id).populate({
            path: "barberId",
            populate: { path: "userId", select: "name email role" }
        });

        if (!wageRecord) {
            return res.status(404).json({ message: "Wage Record not found!" });
        }

        if (req.user.role === "Barber") {
            const barber = await Barber.findOne({ userId: req.user.id });
            if (!barber || wageRecord.barberId._id.toString() !== barber._id.toString()) {
                return res.status(403).json({ message: "Access Denied!" });
            }
        }

        res.status(200).json(wageRecord);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create / calculate wage record
router.post("/", roleMiddleware("Administrator", "Receptionist"), async (req, res) => {
    try {
        let { barberId, month, salary, commission, deductions, payment_status, startDate, endDate } = req.body;

        if (!barberId || !month) {
            return res.status(400).json({ message: "barberId and month are required!" });
        }

        const barber = await Barber.findById(barberId);
        if (!barber) {
            return res.status(404).json({ message: "Barber not found!" });
        }

        const baseSalary = typeof salary === "number" ? salary : 0;
        const totalDeductions = typeof deductions === "number" ? deductions : 0;

        // Auto-calculate commission from completed appointments if commission is not passed
        let computedCommission = commission;
        let appointmentStats = null;

        if (typeof computedCommission !== "number") {
            // Determine date bounds from month string (e.g., "2026-09" or startDate/endDate)
            let start = startDate;
            let end = endDate;

            if (!start && !end && month) {
                const parts = month.split("-");
                if (parts.length === 2) {
                    const year = parseInt(parts[0]);
                    const m = parseInt(parts[1]) - 1;
                    start = new Date(Date.UTC(year, m, 1));
                    end = new Date(Date.UTC(year, m + 1, 0, 23, 59, 59, 999));
                }
            }

            const calc = await calculateBarberCommission(barberId, start, end);
            computedCommission = calc.totalCommission;
            appointmentStats = {
                completedAppointments: calc.completedCount,
                commissionPercentage: calc.commissionRate
            };
        }

        const totalPayable = baseSalary + computedCommission - totalDeductions;

        const wageRecord = await WageRecord.create({
            barberId,
            month,
            salary: baseSalary,
            commission: computedCommission,
            deductions: totalDeductions,
            total_amount: totalPayable,
            payment_status: payment_status || "Pending",
            payment_date: payment_status === "Paid" ? new Date() : null
        });

        res.status(201).json({
            message: "Wage Record created successfully",
            appointmentStats,
            wageRecord
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT update wage record
router.put("/:id", roleMiddleware("Administrator", "Receptionist"), async (req, res) => {
    try {
        const currentRecord = await WageRecord.findById(req.params.id);
        if (!currentRecord) {
            return res.status(404).json({ message: "Wage Record not found!" });
        }

        const updatedSalary = typeof req.body.salary === "number" ? req.body.salary : currentRecord.salary;
        const updatedCommission = typeof req.body.commission === "number" ? req.body.commission : currentRecord.commission;
        const updatedDeductions = typeof req.body.deductions === "number" ? req.body.deductions : currentRecord.deductions;

        req.body.total_amount = updatedSalary + updatedCommission - updatedDeductions;

        if (req.body.payment_status === "Paid" && currentRecord.payment_status !== "Paid") {
            req.body.payment_date = new Date();
        }

        const wageRecord = await WageRecord.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: "Wage Record updated successfully",
            wageRecord
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE wage record
router.delete("/:id", roleMiddleware("Administrator", "Receptionist"), async (req, res) => {
    try {
        const wageRecord = await WageRecord.findByIdAndDelete(req.params.id);

        if (!wageRecord) {
            return res.status(404).json({ message: "Wage Record not found!" });
        }

        res.status(200).json({
            message: "Wage Record deleted successfully",
            wageRecord
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;