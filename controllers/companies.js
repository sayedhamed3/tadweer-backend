const router = require("express").Router();
const verifyToken = require("../middleware/verify-token");
const Company = require("../models/Company");
const Disposal = require("../models/Disposal");
const Achievement = require("../models/Achievement");

// Get all Companies
router.get("/", verifyToken, async (req, res) => {
    try {
        const companies = await Company.find({}).populate("userId", "-hashedPassword -__v,achievements");
        res.json(companies);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Get a Company by Id
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const company = await Company.findById(req.params.id).populate("userId", "-hashedPassword -__v");
        if (!company) {
            return res.status(404).json({ err: "Company not found" });
        }
        res.json(company);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Update Company by Id (For name, phone and profileImage)
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("userId", "-hashedPassword -__v");
        if (!company) {
            return res.status(404).json({ err: "Company not found" });
        }
        res.json(company);
    } catch (error) {
        res.status(500).json(error);
    }
})

// Add address to Company addresses List by Id
router.put("/:id/add-address", verifyToken, async (req, res) => {
    try {
        const company = await Company.findByIdAndUpdate(req.params.id, { $push: { addresses: req.body } }, { new: true }).populate("userId", "-hashedPassword -__v");
        if (!company) {
            return res.status(404).json({ err: "Company not found" });
        }
        res.json(company);
    } catch (error) {
        res.status(500).json(error);
    }
})

// Remove address from Company addresses List by Id using address.name
router.put("/:id/remove-address", verifyToken, async (req, res) => {
    try {
        const company = await Company.findByIdAndUpdate(req.params.id, { $pull: { addresses: { name: req.body.name } } }, { new: true }).populate("userId", "-hashedPassword -__v");
        if (!company) {
            return res.status(404).json({ err: "Company not found" });
        }
        res.json(company);
    } catch (error) {
        res.status(500).json(error);
    }
})


// Route to add a disposal to a company's disposal history and update stats
router.put("/:id/add-disposal", verifyToken, async (req, res) => {
  try {
      const { disposalID } = req.body;

      const date = new Date();

      // Find the company by ID
      const company = await Company.findById(req.params.id);
      if (!company) return res.status(404).json({ error: "Company not found" });

      // Find the disposal by ID and populate materials
      const disposal = await Disposal.findById(disposalID).populate("materials.material");
      if (!disposal) return res.status(404).json({ error: "Disposal not found" });

      // Initialize total stats
      let totalStats = {
          totalCO2Saved: 0,
          totalWaterSaved: 0,
          totalEnergySaved: 0,
          totalTreesSaved: 0,
          totalLandfillSpaceSaved: 0,
          totalOilSaved: 0,
      };

      // Initialize material-specific stats
      let materialStats = {};

      // Calculate stats based on the disposal's materials
      disposal.materials.forEach(item => {
        const material = item.material;
        const quantity = item.quantity;

        const impact = material.environmentalImpact || {};

        // Update total stats
        totalStats.totalCO2Saved += (impact.co2SavedPerUnit || 0) * quantity;
        totalStats.totalWaterSaved += (impact.waterSavedPerUnit || 0) * quantity;
        totalStats.totalEnergySaved += (impact.energySavedPerUnit || 0) * quantity;
        totalStats.totalTreesSaved += (impact.treesSavedPerUnit || 0) * quantity;
        totalStats.totalLandfillSpaceSaved += (impact.landfillSpaceSavedPerUnit || 0) * quantity;
        totalStats.totalOilSaved += (impact.oilSavedPerUnit || 0) * quantity;

        // Update material-specific stats in materialStats object
        const materialType = material.type;

        if (company.stats.materialStats[materialType]) {
            company.stats.materialStats[materialType].totalQuantitySaved += quantity;
        } else {
            company.stats.materialStats[materialType] = { totalQuantitySaved: quantity };
        }
    });

      // Check for achievements based on total stats
      let achievements = [];

      // You would need to check for achievements based on each stat's threshold and material-specific achievements
      for (const stat in totalStats) {
          const statValue = totalStats[stat];
          const companyAchievements = await Achievement.find({
              category: "stat",
              statType: stat,
              threshold: { $lte: statValue },
          });

          companyAchievements.forEach(achievement => {
              if (statValue >= achievement.threshold) {
                  achievements.push(achievement);
              }
          });
      }

      // Check for material-specific achievements
      for (const materialType in materialStats) {
          const materialQuantity = materialStats[materialType].totalQuantitySaved;
          const materialAchievements = await Achievement.find({
              category: "material",
              materialType: materialType,
              threshold: { $lte: materialQuantity },
          });

          materialAchievements.forEach(achievement => {
              if (materialQuantity >= achievement.threshold) {
                  achievements.push(achievement);
              }
          });
      }

      // Update the company stats with the new disposal stats
      company.stats.totalCO2Saved += totalStats.totalCO2Saved;
      company.stats.totalWaterSaved += totalStats.totalWaterSaved;
      company.stats.totalEnergySaved += totalStats.totalEnergySaved;
      company.stats.totalTreesSaved += totalStats.totalTreesSaved;
      company.stats.totalLandfillSpaceSaved += totalStats.totalLandfillSpaceSaved;
      company.stats.totalOilSaved += totalStats.totalOilSaved;

      // Update material stats
      for (const materialType in materialStats) {
          const quantity = materialStats[materialType].totalQuantitySaved;
          company.stats.materialStats.set(materialType, {
              totalQuantitySaved: company.stats.materialStats.get(materialType)?.totalQuantitySaved + quantity || quantity,
          });
      }

      // Add the achievements to the company
      company.achievements.push(...achievements);

      // Push the disposal record into the disposalHistory array
      company.disposalHistory.push({ disposalID, date });
      company.stats.totalDisposals += 1;

      // Save the updated company
      await company.save();

      // Return the response
      res.json({ message: "Disposal added and stats updated", company });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Add a new pick-up schedule
router.put("/:companyId/pickUpSchedule", verifyToken, async (req, res) => {
    try {
        const { companyId } = req.params;
        const { day, time, addressName } = req.body;

        // Validate if all required fields are present
        if (!day || !time || !addressName) {
            return res.status(400).json({ err: "Missing required fields" });
        }

        // if repeated day is selected, return error
        const existingSchedule = await Company.findOne({ _id: companyId, "pickUpSchedule.day": day });
        if (existingSchedule) {
            return res.status(400).json({ err: "Pick-up schedule for this day already exists" });
        }

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ err: "Company not found" });
        }

        // Add the new pick-up schedule
        company.pickUpSchedule.push({ day, time, addressName });
        await company.save();

        res.json(company);
    } catch (error) {
        console.error("Error adding pick-up schedule:", error.message);
        res.status(500).json({ err: error.message });
    }
});

// Modify an existing pick-up schedule
router.put("/:companyId/pickUpSchedule/:scheduleId", verifyToken, async (req, res) => {
    try {
        const { companyId, scheduleId } = req.params;
        const { day, time, addressName } = req.body;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ err: "Company not found" });
        }

        // Find the pick-up schedule to modify
        const schedule = company.pickUpSchedule.id(scheduleId);
        if (!schedule) {
            return res.status(404).json({ err: "Pick-up schedule not found" });
        }

        // Update the pick-up schedule if provided
        if (day) {
            // Check if the new day already exists in the schedule
            const existingSchedule = company.pickUpSchedule.find(s => s.day === day && s._id.toString() !== scheduleId);
            if (existingSchedule) {
                return res.status(400).json({ err: "Pick-up schedule for this day already exists" });
            }
            schedule.day = day;
        }
        if (time) {
            schedule.time = time;
        }
        if (addressName) {
            schedule.addressName = addressName;
        }
        
        await company.save();

        res.json(company);
    } catch (error) {
        console.error("Error modifying pick-up schedule:", error.message);
        res.status(500).json({ err: error.message });
    }
});

// Remove a pick-up schedule
router.delete("/:companyId/pickUpSchedule/:scheduleId", verifyToken, async (req, res) => {
    try {
        const { companyId, scheduleId } = req.params;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ err: "Company not found" });
        }

        // Find and remove the pick-up schedule
        const schedule = company.pickUpSchedule.id(scheduleId);
        if (!schedule) {
            return res.status(404).json({ err: "Pick-up schedule not found" });
        }

        // Remove the schedule by popping it from the array
        company.pickUpSchedule.pull(scheduleId);
        await company.save();

        res.json(company);
    } catch (error) {
        console.error("Error removing pick-up schedule:", error.message);
        res.status(500).json({ err: error.message });
    }
});

// Remove all pick-up schedules
router.delete("/:companyId/pickUpSchedule", verifyToken, async (req, res) => {
    try {
        const { companyId } = req.params;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ err: "Company not found" });
        }

        // Clear the entire pickUpSchedule array
        company.pickUpSchedule = [];
        await company.save();

        res.json(company);
    } catch (error) {
        console.error("Error clearing pick-up schedules:", error.message);
        res.status(500).json({ err: error.message });
    }
});


module.exports = router;