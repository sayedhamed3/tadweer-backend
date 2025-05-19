const router = require("express").Router();
const verifyToken = require("../middleware/verify-token");
const Achievement = require("../models/Achievement");

// get all Achievements
router.get("/", verifyToken, async (req, res) => {
    try {
        const achievements = await Achievement.find()
        res.json(achievements);
    } catch (error) {
        res.status(500).json(error);
    }
});

// get a Achievement by Id
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const achievement = await Achievement.findById(req.params.id)
        if (!achievement) {
            return res.status(404).json({ err: "Achievement not found" });
        }
        res.json(achievement);
    } catch (error) {
        res.status(500).json(error);
    }
});




module.exports = router;