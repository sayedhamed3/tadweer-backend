const {Schema, model} = require("mongoose")

const workerSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        text: true
    },
    currentLocation: {
        lat: Number,
        lng: Number
    },
})

const Worker = model("Worker", workerSchema)

module.exports = Worker