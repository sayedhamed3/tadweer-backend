const {Schema, model} = require("mongoose")
const User = require("./User")

const addressSchema = new Schema({
    name: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    coordinates: {
      type: {
        lat: {
          type: Number,
          required: true,
        },
        lng: {
          type: Number,
          required: true,
        },
      },
    },
  })

const companySchema = new Schema({

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

    profileImage: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        text: true
    },

    pickUpSchedule:[
        {
            day: {
                type: String,
                required: true,
                enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            },
            time: {
                type: String,
                required: true
            },
            address: {
                type: addressSchema,
                required: true
            },
        }
    ],

    disposalHistory: [{
        disposalID: {
            type: Schema.Types.ObjectId,
            ref: "Disposal",
            required: true
        },
        date: {
            type: Date,
            required: true
        }
    }],
    addresses: [{
        type: addressSchema,
        required: true,
    }],
    stats: {
        totalDisposals: {
            type: Number,
            default: 0 
        },
        totalCO2Saved: {
            type: Number,
            default: 0 
        },
        totalWaterSaved: {
            type: Number,
            default: 0 
        },
        totalEnergySaved: {
            type: Number,
            default: 0  
        },
        totalTreesSaved: {
            type: Number,
            default: 0  
        },
        totalLandfillSpaceSaved: {
            type: Number,
            default: 0   // Total landfill space saved for all materials
        },
        totalOilSaved: {
            type: Number,
            default: 0   // Total oil saved for all materials
        },
        materialStats: {
            type: Map,
            of: {
                totalQuantitySaved: {
                    type: Number, // The total quantity recycled for this material
                    default: 0
                }
            },
            default: {}
        }
    },
})

const Company = model("Company", companySchema)

module.exports = Company