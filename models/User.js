const {Schema, model} = require("mongoose")

const userSchema = new Schema({
    username: {
        type: String,
        required:[true,"Email is Required"],
        unique:true,
        lowercase:true,
        trim:true
    },
    hashedPassword:{
        type:String,
        required:[true,"Password is Required"]
    },
    role:{
        type:String,
        enum:["Company","Worker"],
        default:"Company"
    },
    status:{
        type:String,
        enum:["active","deleted"],
        default:"active",
        required:true
    },
    
}, {timestamps: true})

const User = model("User",userSchema)

module.exports = User