const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name : {
        type: String,
        unique : true
    },
    eid : {
        type:String,
        unique:true
    },
    attendanceParams : Schema.Types.Mixed   
}) 

const User = mongoose.model('User',userSchema)

module.exports = User