const router = require("express").Router();
const verifyToken = require("../middleware/verify-token");
const Disposal = require("../models/Disposal");
const Worker = require("../models/Worker");
const Company = require("../models/Company");
const Material = require("../models/Material");
const User = require("../models/User");
const axios = require("axios");

// Get all Disposals
router.get("/", verifyToken, async (req, res) => {
    try {
        const disposals = await Disposal.find({})
            .populate("worker")
            .populate("company");

        const disposalsWithLocation = disposals.map(disposalDoc => {
            const disposal = disposalDoc.toObject(); // convert to plain object

            const companyAddresses = disposal.company.addresses;

            const matchingAddress = companyAddresses.find(
                address => address.name === disposal.addressName
            );

            if (matchingAddress) {
                disposal.location = matchingAddress;
            }

            return disposal;
        });

        res.json(disposalsWithLocation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Get all pending disposals
router.get("/pending", verifyToken, async (req, res) => {
    try {
        const disposals = await Disposal.find({ status: "Pending" })
            .populate("worker")
            .populate("company")
        res.json(disposals);
    } catch (error) {
         res.status(500).json({error: error.message});
    }
});

// Get disposal by Id
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const disposal = await Disposal.findById(req.params.id).populate("worker").populate("company").populate("materials.material")
        if (!disposal) {
            return res.status(404).json({ err: "Disposal not found" });
        }
        res.json(disposal);
    } catch (error) {
         res.status(500).json({error: error.message});
    }
});

// Get disposal by workerId
router.get("/worker/:workerId", verifyToken, async (req, res) => {
    try {
        // check if workerId is valid
        const worker = await Worker.findById(req.params.workerId);
        if (!worker) {
            return res.status(404).json({ err: "Worker not found" });
        }


        const disposals = await Disposal.find({ worker: req.params.workerId })
            .populate("worker")
            .populate("company")
        if (!disposals) {
            return res.status(404).json({ err: "Disposal not found" });
        }

        res.json(disposals);
    } catch (error) {
         res.status(500).json({error: error.message});
    }
});

// Get disposal by companyId
router.get("/company/:companyId", verifyToken, async (req, res) => {
    try {
        // check if companyId is valid
        const company = await Company.findById(req.params.companyId);
        if (!company) {
            return res.status(404).json({ err: "Company not found" });
        }

        const disposals = await Disposal.find({ company: req.params.companyId })
            .populate("worker")
            .populate("company")
        if (!disposals) {
            return res.status(404).json({ err: "Disposal not found" });
        }
        res.json(disposals);
    } catch (error) {
            res.status(500).json({error: error.message});
    }
});


// Create a new disposal
router.post("/", verifyToken, async (req, res) => {
    try {
        const {company, disposalDate, addressName} = req.body;

        // Create a new disposal with status "Pending"
        const newDisposal = new Disposal({
            company,
            disposalDate,
            addressName,
            status: "Pending"
        });

        await newDisposal.save();
        res.status(201).json(newDisposal);
    } catch (error) {
         res.status(500).json({error: error.message});
    }
})

// Worker accepts disposal
router.put("/:id/accept", verifyToken, async (req, res) => {
    try {
        console.log("Executing accept disposal route")
        console.log(req.user)
        const disposal = await Disposal.findById(req.params.id)

        if (!disposal) {
            return res.status(404).json({ err: "Disposal not found" });
        }
        // Check if the disposal is already accepted
        if (disposal.status !== "Pending") {
            return res.status(400).json({ err: "Disposal is already accepted or completed" });
        }

        // take current logged in user as worker
        const workerUserId = req.user._id; // Assuming you have the worker ID in the request

        // Finf worker ID by userId
        const worker = await Worker.findOne({ userId: workerUserId });

        if (!worker) {
            return res.status(404).json({ err: "Worker not found" });
        }

        // Update the disposal with the worker ID and change status to "Accepted"
        disposal.worker = worker._id;
        disposal.status = "Accepted";
        await disposal.save();

        res.json(disposal);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})

// Worker rejects disposal
router.put("/:id/reject", verifyToken, async (req, res) => {
    try {
        const { rejectionMessage } = req.body;
        const disposal = await Disposal.findById(req.params.id)

        // Get current logged in user as worker
        const workerUserId = req.user._id; // Assuming you have the worker ID in the request



        if (!disposal) {
            return res.status(404).json({ err: "Disposal not found" });
        }

        // Check if the disposal is already accepted
        if (disposal.status !== "Pending") {
            return res.status(400).json({ err: "Disposal is not pending" });
        }

        // Check if the worker is the one who accepted the disposal
        const worker = await Worker.findOne({ userId: workerUserId });
        if (!worker) {
            return res.status(404).json({ err: "Worker not found" });
        }

        // Update the disposal status to "Rejected" and add rejection message and add worker ID
        disposal.worker = worker._id;
        disposal.status = "Rejected";
        disposal.rejectionMessage = rejectionMessage;

        await disposal.save();

        res.json(disposal);
    } catch (error) {
         res.status(500).json({error: error.message});
    }
})

// Complete disposal
router.put("/:id/complete", verifyToken, async (req, res) => {
    try {
        const disposal = await Disposal.findById(req.params.id).populate("company");

        if (!disposal) {
            return res.status(404).json({ err: "Disposal not found" });
        }

        // Ensure disposal is accepted before completion
        if (disposal.status !== "Accepted") {
            return res.status(400).json({ err: "Disposal is not accepted yet" });
        }

        

        const companyId = disposal.company?._id || disposal.company;
        const disposalId = disposal._id;

        // Notify the company service to add this completed disposal and use the current timestamp
        
        try {
            const response = await axios.put(`http://localhost:3000/companies/${companyId}/add-disposal`, {
                disposalID: disposalId // Send current timestamp
            }, {
                headers: {
                    Authorization: `Bearer ${req.headers.authorization.split(" ")[1]}`
                }
            });

            console.log("Disposal added to company:", response.data);
        } catch (error) {
            if (error.response) {
                // The server responded with a status other than 2xx
                console.error("Error response from company service:", error.response.data);
                return res.status(error.response.status).json({ err: error.response.data });
            } else {
                // Network or other errors
                console.error("Error notifying company service:", error.message);
                return res.status(500).json({ err: "Error notifying company service" });
            }
}


        // Update disposal status
        disposal.status = "Completed";
        await disposal.save();

        res.json(disposal);
    } catch (error) {
        console.error("Error completing disposal:", error.message);
        res.status(500).json({ error: error.message });
    }
});





// Update disposal by Id
router.put("/:id", verifyToken, async (req, res) => {
    try {

        // check if the disposal is already accepted
        const disposal = await Disposal.findById(req.params.id)
        if (!disposal) {
            return res.status(404).json({ err: "Disposal not found" });
        }
        if (disposal.status !== "Pending") {
            return res.status(400).json({ err: "Disposal cannot be updated" });
        }

        // Check if current user is the company that is updating the disposal
        const loggedInUser = req.user._id; // Assuming you have the company ID in the request

        const company = await Company.findOne({ userId: loggedInUser });
        if (!company) {
            return res.status(404).json({ err: "Company not found" });
        }
        const companyId = company._id;

        console.log(req.user._id)
        console.log(disposal.company.toString())
        if (disposal.company.toString() !== companyId.toString()) {
            return res.status(403).json({ err: "You are not authorized to update this disposal" });
        }
        // Update the disposal with the new data
        const updatedDisposal = await Disposal.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate("worker")
            .populate("company");
        if (!updatedDisposal) {
            return res.status(404).json({ err: "Disposal not found" });
        }   
        res.json(updatedDisposal);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})

// Add material, quantity to disposal materials List by Id
router.put("/:id/add-material", verifyToken, async (req, res) => {
    try {
        const {material, quantity} = req.body;
        // Calculate the calculatedPrice based on quantity and price

        const materialData = await Material.findById(material);
        if (!materialData) {
            return res.status(404).json({ err: "Material not found" });
        }

        const convertedQuantity = quantity * materialData.conversionFactor; // Convert quantity to the base unit
        const calculatedPrice = convertedQuantity * materialData.pricePerUnit; // Calculate the price based on the converted quantity and price per unit



        const disposal = await Disposal.findByIdAndUpdate(req.params.id, { $push: { materials: {material, quantity, calculatedPrice} } }, { new: true })

        // Recacluate totalPrice manually after adding new material
        // Recalculate totalPrice using calculatedPrice
        disposal.totalPrice = disposal.materials.reduce((acc, item) => acc + (item.calculatedPrice * item.quantity), 0);

        await disposal.save();

        if (!disposal) {
            return res.status(404).json({ err: "Disposal not found" });
        }
        res.json(disposal);
    }
    catch (error) {
        res.status(500).json({error: error.message});
    }
})

// Remove material from disposal materials List by Id using materials.material
router.put("/:id/remove-material", verifyToken, async (req, res) => {
    try {
        const disposal = await Disposal.findByIdAndUpdate(req.params.id, { $pull: { materials: { material: req.body.material } } }, { new: true })

        // Recacluate totalPrice manually after removing material
        disposal.totalPrice = disposal.materials.reduce((acc, item) => acc + (item.calculatedPrice * item.quantity), 0);
        await disposal.save();

        if (!disposal) {
            return res.status(404).json({ err: "Disposal not found" });
        }
        res.json(disposal);
    } catch (error) {
         res.status(500).json({error: error.message});
    }
})


// Calculate stats for a disposal
router.get("/:id/calculate-stats", verifyToken, async (req, res) => {
    try {
      const disposal = await Disposal.findById(req.params.id).populate("materials.material");
      if (!disposal) {
        return res.status(404).json({ err: "Disposal not found" });
      }
  
      let stats = {
        totalCO2Saved: 0,
        totalWaterSaved: 0,
        totalEnergySaved: 0,
        totalTreesSaved: 0,
        totalLandfillSpaceSaved: 0,
        totalOilSaved: 0,
      };
  
      disposal.materials.forEach(item => {
        const material = item.material;
        const quantity = item.quantity;
  
        stats.totalCO2Saved += material.co2 * quantity;
        stats.totalWaterSaved += material.water * quantity;
        stats.totalEnergySaved += material.energy * quantity;
        stats.totalTreesSaved += material.trees * quantity;
        stats.totalLandfillSpaceSaved += material.landfill * quantity;
        stats.totalOilSaved += material.oil * quantity;
      });
  
      res.json(stats);
    } catch (error) {
       res.status(500).json({error: error.message});
    }
  });
  




module.exports = router;