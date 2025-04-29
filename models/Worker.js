const {Schema, model} = require("mongoose")

const workerSchema = new Schema({

})

const Worker = model("Worker", workerSchema)

module.exports = Worker