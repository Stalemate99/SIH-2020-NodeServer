var express = require('express')
var bodyParser = require('body-parser')
const User = require('./schema')

var app = express()
app.use(bodyParser.json())

var Service = require('./service.js')

app.get("/",(req,res) => {
    res.send("hi there");
})

//Resgistering Employees
app.post('/register',(req, res)=>{
    let body = req.body
    //Sending Info to DB
    let key = new Date().toLocaleDateString()
    const newUser = new User({
        name : body.name,
        eid : body.eid,
        attendanceParams:{} 
    })
    newUser.attendanceParams[key] = {
        timestamp : body.timestamp,
        attendance : body.val
    }
    newUser.save().then(()=>{
        console.log("success")
        res.send({"code":200,"message":"Record inserted successfully"})
    }).catch(err=>{
        console.log(err)
    })
    //Sending info to Flask
    //Validation
})

app.get('/getUsers',async (req,res)=>{
    let usr = await User.find({})
    if(!usr){
        return res.send({"code":400,"message":"No users obtained"})
    }
    console.log(usr)    
    res.send({"code":200,"message":"Record inserted successfully"}) 
})

app.get('/getUser', async(req,res)=>{
    console.log(req.query)
    let eid = req.query.eid
    let usr = await User.findOne({eid})
    if(!usr){
        return res.send({"code":400,"message":"No users obtained"})
    }
    console.log("Successful Read XD")
    res.send(usr)
})

app.post('/updAttendance',async (req,res)=>{
    let {eid, timestamp, val} = req.body
    let key = new Date().toLocaleDateString()
    let updUsr = await User.findOne({eid})
    updUsr.attendanceParams[key] = {
        timestamp, 
        attendance : val
    }
    updUsr.save().then(()=>{
        console.log("successful update XD")
        res.send({"code":200,"message":"Record updated successfully"})
    }).catch(err=>{
        console.log(err)
    })
})

app.post('/validateAttendance',(req,res)=>{
    console.log(req.body)
    let {eid, audio} = req.body;
    res.send({});
})

app.listen(2000,()=>{
    console.log("Server runnnig on PORT 2000...")
})

