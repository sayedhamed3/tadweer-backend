const {Schema, model} = require("mongoose")

const collectionSchema = new Schema({

})

const Collection = model("Collection", collectionSchema)

module.exports = Collection