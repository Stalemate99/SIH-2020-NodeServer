const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name : String,
    eid : String,
    attendanceParams : Schema.Types.Mixed   
}) 

const User = mongoose.model('User',userSchema)

module.exports = User