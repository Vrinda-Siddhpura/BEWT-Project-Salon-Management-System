const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../Schema/users");
const authMiddleware = require("../Middleware/authMiddleware");
const roleMiddleware = require("../Middleware/roleMiddleware");

router.use(authMiddleware);
router.use(roleMiddleware("Administrator"));

// getUser
router.get("/", async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// getUserById
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// addUser
router.post("/", async (req, res) => {
    try {
        const { name, email, password, role, status } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required!" });
        }

        const checkEmail = await User.findOne({ email });
        if (checkEmail) {
            return res.status(400).json({ message: "Email already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "Barber",
            status: status || "Active"
        });

        const userObj = user.toObject();
        delete userObj.password;

        res.status(201).json({
            message: "User added successfully",
            user: userObj
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// updateUserById
router.put("/:id", async (req, res) => {
    try {
        const updateData = { ...req.body };

        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.status(200).json({
            message: "User updated successfully",
            user
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// deleteUser
router.delete("/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.status(200).json({
            message: "User deleted successfully",
            user
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;