const {Schema, model} = require("mongoose")

const materialSchema = new Schema({

})

const Material = model("Material", materialSchema)

module.exports = Material