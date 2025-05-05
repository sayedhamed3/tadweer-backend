const { text } = require("express")
const {Schema, model} = require("mongoose")

const materialSchema = new Schema({

    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        text: true
    },
    type: {
        type: String,
        required: true,
        enum: ["plastic", "paper", "metal", "glass", "electronic", "organic"]
    },
    unit: {
        type: String,
        required: true,
        enum: ["kg", "ton", "liter", "piece"],
        default: "kg"
    },
    conversionFactor: {
        type: Number,
        required: true,
        default: 1
    },
    environmentalImpact: {
        co2SavedPerUnit : Number, // in kg
        waterSavedPerUnit : Number, // in liters
        energySavedPerUnit : Number, // in kWh
        treesSavedPerUnit : Number, // in number of trees
        landfillSpaceSavedPerUnit : Number, // in cubic meters
        oilSavedPerUnit : Number, // in liters

    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    pricePerUnit: {
        type: Number,
        required: true
    }
}, {
    timestamps: true })

const Material = model("Material", materialSchema)

module.exports = Material