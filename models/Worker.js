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
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }
})

const Worker = model("Worker", workerSchema)

module.exports = Worker