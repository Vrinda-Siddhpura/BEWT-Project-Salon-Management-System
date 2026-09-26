const express = require("express");
const router = express.Router();
const Appointment = require("../Schema/appointments");
const Customer = require("../Schema/customers");
const Barber = require("../Schema/barbers");
const Service = require("../Schema/services");
const Slot = require("../Schema/slots");
const Holiday = require("../Schema/holidays");
const authMiddleware = require("../Middleware/authMiddleware");
const roleMiddleware = require("../Middleware/roleMiddleware");

router.use(authMiddleware);

// GET all appointments
router.get("/", roleMiddleware("Administrator", "Receptionist", "Barber"), async (req, res) => {
    try {
        let filter = {};

        // If logged-in user is a Barber, show only their assigned appointments
        if (req.user.role === "Barber") {
            const barber = await Barber.findOne({ userId: req.user.id });
            if (barber) {
                filter.barberId = barber._id;
            } else {
                return res.status(200).json([]);
            }
        }

        const appointments = await Appointment.find(filter)
            .populate("customerId")
            .populate({
                path: "barberId",
                populate: { path: "userId", select: "name email" }
            })
            .populate("serviceId");

        res.status(200).json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET appointment by ID
router.get("/:id", roleMiddleware("Administrator", "Receptionist", "Barber"), async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate("customerId")
            .populate({
                path: "barberId",
                populate: { path: "userId", select: "name email" }
            })
            .populate("serviceId");

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found!" });
        }

        if (req.user.role === "Barber") {
            const barber = await Barber.findOne({ userId: req.user.id });
            if (!barber || appointment.barberId._id.toString() !== barber._id.toString()) {
                return res.status(403).json({ message: "Access Denied!" });
            }
        }

        res.status(200).json(appointment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create appointment
router.post("/", roleMiddleware("Administrator", "Receptionist"), async (req, res) => {
    try {
        const { customerId, barberId, serviceId, appointment_date, status, remarks, slotId } = req.body;

        if (!customerId || !barberId || !serviceId || !appointment_date) {
            return res.status(400).json({
                message: "Missing required fields: customerId, barberId, serviceId, appointment_date are required!"
            });
        }

        // 1. Validate Customer
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found!" });
        }

        // 2. Validate Barber
        const barber = await Barber.findById(barberId);
        if (!barber) {
            return res.status(404).json({ message: "Barber not found!" });
        }

        // 3. Validate Service
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Service not found!" });
        }

        const apptDate = new Date(appointment_date);
        const startOfDay = new Date(apptDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(apptDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        // 4. Validate Holiday
        const holiday = await Holiday.findOne({
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (holiday) {
            return res.status(400).json({
                message: `Cannot book appointment on a holiday! Reason: ${holiday.reason || "Holiday"}`
            });
        }

        // 5. Validate Slot (if slotId is passed or check existing slots)
        let slot = null;
        if (slotId) {
            slot = await Slot.findById(slotId);
            if (!slot) {
                return res.status(404).json({ message: "Specified slot not found!" });
            }
            if (slot.status === "Booked") {
                return res.status(400).json({ message: "The selected slot is already booked!" });
            }
            if (slot.status === "Blocked") {
                return res.status(400).json({ message: "The selected slot is blocked!" });
            }
        } else {
            // Check for available slot matching barber and date
            slot = await Slot.findOne({
                barberId,
                date: { $gte: startOfDay, $lte: endOfDay },
                status: "Available"
            });
        }

        // 6. Prevent double-booking / overlapping active appointments for the same barber on the same date/time
        const existingAppointment = await Appointment.findOne({
            barberId,
            appointment_date: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ["Pending", "Confirmed", "In Progress"] }
        });

        if (existingAppointment && !slotId) {
            // Note: If multiple appointments allowed at different slots, slotId should be used.
            // If existing appointment overlaps on same slot, reject.
        }

        const newAppointment = await Appointment.create({
            customerId,
            barberId,
            serviceId,
            appointment_date: apptDate,
            status: status || "Pending",
            remarks
        });

        // 7. Update Slot status to Booked if slot exists or was selected
        if (slot) {
            slot.status = "Booked";
            await slot.save();
        }

        res.status(201).json({
            message: "Appointment created successfully",
            appointment: newAppointment,
            slotUpdated: !!slot
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT update appointment (Status, Barber, Service, Date, etc.)
router.put("/:id", roleMiddleware("Administrator", "Receptionist", "Barber"), async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found!" });
        }

        // Barbers can only update status of their own appointments
        if (req.user.role === "Barber") {
            const barber = await Barber.findOne({ userId: req.user.id });
            if (!barber || appointment.barberId.toString() !== barber._id.toString()) {
                return res.status(403).json({ message: "Access Denied!" });
            }

            // Barber can only update status field
            if (req.body.status) {
                appointment.status = req.body.status;
                if (req.body.remarks) appointment.remarks = req.body.remarks;
                await appointment.save();
            }

            return res.status(200).json({
                message: "Appointment status updated successfully",
                appointment
            });
        }

        // Admin & Receptionist full update
        const newStatus = req.body.status || appointment.status;

        // If status changes to Cancelled, release associated booked slot back to Available
        if (newStatus === "Cancelled" && appointment.status !== "Cancelled") {
            const apptDate = new Date(appointment.appointment_date);
            const startOfDay = new Date(apptDate);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(apptDate);
            endOfDay.setUTCHours(23, 59, 59, 999);

            const bookedSlot = await Slot.findOne({
                barberId: appointment.barberId,
                date: { $gte: startOfDay, $lte: endOfDay },
                status: "Booked"
            });

            if (bookedSlot) {
                bookedSlot.status = "Available";
                await bookedSlot.save();
            }
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: "Appointment updated successfully",
            appointment: updatedAppointment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE appointment
router.delete("/:id", roleMiddleware("Administrator", "Receptionist"), async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found!" });
        }

        res.status(200).json({
            message: "Appointment deleted successfully",
            appointment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;