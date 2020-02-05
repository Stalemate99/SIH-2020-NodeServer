'use strict'
const mongoose = require('mongoose')
const env = require('./environment')

mongoose.Promise = global.Promise

const mongoUri = `mongodb://${env.db}:${env.key}@${env.db}.documents.azure.com:${env.port}/?ssl=true`

mongoose.connect(mongoUri,{useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex: true,},(err)=>{
    if(err){
      return console.log("Sambavam")
    }
    console.log("Successfully connected to Azure!")
})
