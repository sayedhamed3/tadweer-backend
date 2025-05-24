const { text } = require("express")
const {Schema, model} = require("mongoose")

const materialSchema = new Schema({

    name: {
        type: String,
        required: true,
        unique: true,
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
        co2SavedPerUnit : {type: Number, default: 0}, // in kg
        waterSavedPerUnit : {type: Number, default: 0}, // in liters
        energySavedPerUnit : {type: Number, default: 0}, // in kWh
        treesSavedPerUnit : {type: Number, default: 0}, // in number of trees
        landfillSpaceSavedPerUnit : {type: Number, default: 0}, // in cubic meters
        oilSavedPerUnit : {type: Number, default: 0}, // in liters

    },
    description: {
        type: String,
        required: true
    },
    recyclingProcess: {
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