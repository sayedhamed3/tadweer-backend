const router = require("express").Router();
const verifyToken = require("../middleware/verify-token");
const Worker = require("../models/Worker");

// Get all Workers
router.get("/", verifyToken, async (req, res) => {
    try {
        const workers = await Worker.find({}).populate("userId", "-hashedPassword -__v");
        res.json(workers);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Get a Worker by Id
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const worker = await Worker.findById(req.params.id).populate("userId", "-hashedPassword -__v");
        if (!worker) {
            return res.status(404).json({ err: "Worker not found" });
        }
        res.json(worker);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Update Worker by Id
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("userId", "-hashedPassword -__v");
        if (!worker) {
            return res.status(404).json({ err: "Worker not found" });
        }
        res.json(worker);
    } catch (error) {
        res.status(500).json(error);
    }
});


module.exports = router;