const {Schema, model} = require("mongoose")

const workerSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true
    }
})

const Worker = model("Worker", workerSchema)

module.exports = Worker