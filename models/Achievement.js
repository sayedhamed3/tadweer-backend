const {Schema, model} = require("mongoose")

const achievementSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        text: true
    },
    description: {
        type: String,
        required: true
    },
    badgeIcon: {
        type: String,
        required: true
    },
    material: {
        type: Schema.Types.ObjectId,
        ref: "Material",
        required: true
    },
    thresholdQuantity: {
        type: Number,
        required: true
    },
})

const Achievement = model("Achievement",achievementSchema)

module.exports = Achievement
