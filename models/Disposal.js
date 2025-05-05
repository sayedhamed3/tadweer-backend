const {Schema, model} = require("mongoose")

const disposalSchema = new Schema({
    company: {
        type: Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    worker: {
        type: Schema.Types.ObjectId,
        ref: "Worker",
        required: true
    },
    disposalDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected", "Completed"," Cancelled"],
        default: "Pending"
    },
    rejectionMessage: {
        type: String,
        default: ""
    },
    materials: [
        {
            material: {
                type: Schema.Types.ObjectId,
                ref: "Material",
                required: true
            },
            quantity: {
                type: Number, // in units (univeral unit)
                required: true
            },
            calculatedPrice: {
                type: Number,
                required: true
            },
        }
    ],
    totalPrice: {
        type: Number,
        default: 0
    },
}, {timestamps: true})

const Disposal = model("Disposal", disposalSchema)

module.exports = Disposal