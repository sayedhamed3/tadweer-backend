const router = require("express").Router();
const verifyToken = require("../middleware/verify-token");
const Material = require("../models/Material");

// Get all Materials
router.get("/", verifyToken, async (req, res) => {
    try {
        const materials = await Material.find({})
        res.json(materials);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Search + pagination
router.get("/search", verifyToken, async (req, res) => {
    
    const escapeRegEx = (text) => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    const rawSearch = req.query.search || "";
    const typeFilter = req.query.type || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const searchQuery = escapeRegEx(rawSearch.trim());

    const filter = {};

    if (searchQuery) {
        filter.name = { $regex: searchQuery, $options: "i" };
    }

    if (typeFilter) {
        filter.type = typeFilter.toLowerCase();
    }

    try {
        // Check if the type is valid
        const materials = await Material.find(filter).skip(skip).limit(limit);
        const total = await Material.countDocuments(filter);

        res.json({
            page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            materials
        });
    } catch (error) {
        res.status(500).json(error);
    }
});

// Get a Material by Id
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        if (!material) {
            return res.status(404).json({ err: "Material not found" });
        }
        res.json(material);
    } catch (error) {
        res.status(500).json(error);
    }
});







module.exports = router;