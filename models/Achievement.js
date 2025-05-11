const { Schema, model } = require("mongoose");

const achievementSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    text: true,
  },
  description: {
    type: String,
    required: true,
  },
  badgeIcon: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["stat", "material"],
  },
  // For 'stat' type achievements
  statType: {
    type: String,
    required: function() { return this.category === 'stat'; },
    enum: [
      "totalDisposals",
      "totalCO2Saved",
      "totalWaterSaved",
      "totalEnergySaved",
      "totalTreesSaved",
      "totalLandfillSpaceSaved",
      "totalOilSaved",
    ],
  },
  // For 'material' type achievements
  materialType: {
    type: String,
    required: function() { return this.category === 'material'; },
    enum: ["plastic", "paper", "metal", "glass", "electronic", "organic"],
    ref: "Material",
  },
  // The target value to reach
  threshold: {
    type: Number,
    required: true,
  },
  // Difficulty level (optional)
  level: {
    type: String,
    enum: ["bronze", "silver", "gold", "platinum"],
    default: "bronze"
  }
}, {
  // Ensure either statType or materialType is provided based on category
  discriminatorKey: 'category'
});

const Achievement = model("Achievement", achievementSchema);
module.exports = Achievement;