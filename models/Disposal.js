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
    },
    disposalDate: {
        type: Date,
        required: true
    },
    addressName:{
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected", "Completed"," Cancelled"],
        default: "Pending"
    },
    rejectionMessage: {
        type: String,
        default: "",
        validate: {
            validator: function(value) {
                return this.status !== "Rejected" || value.trim() !== "";
            },
            message: "Rejection message is required if status is 'Rejected'."
        }
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

disposalSchema.pre('save', function(next) {
    this.totalPrice = this.materials.reduce((acc, material) => acc + material.calculatedPrice, 0);
    next();
});


const Disposal = model("Disposal", disposalSchema)

module.exports = Disposal