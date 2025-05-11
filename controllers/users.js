const router = require("express").Router();
const verifyToken = require("../middleware/verify-token");

const bcrypt = require("bcrypt");

const User = require("../models/User");

// Get all users
router.get("/", verifyToken, async (req, res) => {
    try {
        const users = await User.find({}).select("-hashedPassword -__v");
        res.json(users);
    } catch (error) {
        res.status(500).json(error);
    }
})

// Get a user by Id
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-hashedPassword -__v")
        if (!user) {
            return res.status(404).json({ err: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json(error);
    }
})

// Update Username or Password by Id
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-hashedPassword -__v")

        if (!user) {
            return res.status(404).json({ err: "User not found" });
        }

        // if username provided, check if it is unique
        if (req.body.username) {
            const foundUser = await User.findOne({ username: req.body.username })
            if (foundUser && foundUser._id.toString() !== req.params.id) {
                return res.status(409).json({ err: "username already taken" })
            }
        }

        if (req.body.password) {
            // validate the password
             const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/ // Example regex for password validation
            if (!passwordRegex.test(req.body.password)) {
                return res.status(400).json({ err: "Password must be at least 8 characters long and contain at least one letter and one number" })
            }

            req.body.hashedPassword = await bcrypt.hashSync(req.body.password, 12)
        }
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .select("-hashedPassword -__v")
        if (!updatedUser) {
            return res.status(404).json({ err: "User not found" });
        }


        res.json(updatedUser);
    } catch (error) {
        res.status(500).json(error);
    }
})


// Delete User by changing status to Deleted
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { status: "Deleted" }, { new: true })
            .select("-hashedPassword -__v")
        if (!user) {
            return res.status(404).json({ err: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = router;