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

    profileImage: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },

    pickUpSchedule:[
        {
            day: {
                type: String,
                required: true,
                enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            },
            time: {
                type: String,
                required: true
            },
            addressName: {
                type: String,
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
            plastic: { totalQuantitySaved: { type: Number, default: 0 } },
            paper: { totalQuantitySaved: { type: Number, default: 0 } },
            metal: { totalQuantitySaved: { type: Number, default: 0 } },
            glass: { totalQuantitySaved: { type: Number, default: 0 } },
            electronic: { totalQuantitySaved: { type: Number, default: 0 } },
            organic: { totalQuantitySaved: { type: Number, default: 0 } },
        }
    },
     achievements: [
            {
                type: Schema.Types.ObjectId,
                ref: "Achievement",
            }
        ]
})

const Company = model("Company", companySchema)

module.exports = Company