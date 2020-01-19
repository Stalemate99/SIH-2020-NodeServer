var express = require('express')
var bodyParser = require('body-parser')
var multer = require('multer')
const User = require('./schema')
const multipart = require('connect-multiparty')

var app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(multipart())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "*");
    next(); 
  });
var server = app.listen(process.env.PORT||2000)
var io = require('socket.io').listen(server)

var Service = require('./service.js')

app.get("/", (req, res) => {
    res.send("hi there");
})

io.on('connection',(socket)=>{
    console.log("Socket Connected!")
    // socket.emit('Attendance',"connect please")
})

//Resgistering Employees
app.post('/register', (req, res) => {
    let body = req.body
    //Sending Info to DB
    let key = new Date().toLocaleDateString()
    const newUser = new User({name: body.name, eid: body.eid, attendanceParams: {}})
    newUser.attendanceParams[key] = {
        timestamp: body.timestamp,
        attendance: body.val
    }
    newUser
        .save()
        .then(() => {
            console.log("success")
            res.send({"code": 200, "message": "Record inserted successfully"})
        })
        .catch(err => {
            console.log(err)
        })
        //Sending info to Flask Validation
})

app.get('/getUsers', async(req, res) => {
    let usr = await User.find({})
    if (!usr) {
        return res.send({"code": 400, "message": "No users obtained"})
    }
    console.log(usr)
    res.send({"code": 200, "message": "Record inserted successfully"})
})

app.get('/getUser', async(req, res) => {
    console.log(req.query)
    let eid = req.query.eid
    let usr = await User.findOne({eid})
    if (!usr) {
        return res.send({"code": 400, "message": "No users obtained"})
    }
    console.log("Successful Read XD")
    res.send(usr)
})

app.post('/updAttendance', async(req, res) => {
    let {eid, timestamp, val} = req.body
    // let key = new Date().toLocaleDateString()
    let key = "2/3/2020"
    let updUsr = await User.findOne({eid})
    updUsr.attendanceParams[key] = {
        timestamp,
        attendance: val
    };
    let replaceUsr = {}
    replaceUsr.name = updUsr.name
    replaceUsr.eid = updUsr.eid
    replaceUsr.attendanceParams = updUsr.attendanceParams
    console.log(replaceUsr)
    await User.deleteOne({_id: updUsr._id})
    let newUsr = await new User(replaceUsr)
    newUsr
        .save()
        .then(() => {
            console.log("successful update XD")
            io.sockets.emit('changeAttendance',replaceUsr)
            res.send({"code": 200, "message": "Record updated successfully"})
        })
        .catch(err => {
            console.log(err)
        })
})

// const upload_audio = multer.diskStorage({
//     destination:(req, file, cb)=>{
//         cb(null, "appAudio")
//     },
//     filename:(req, file, cb)=>{
//         cb(null, "Sample.wav")
//     }
// })

const uploadAudio = multer({
    // storage:upload_audio,
    dest:'appAudio/',
    limits: {
        fileSize: 3000000
    }
})

app.post('/appAudio', uploadAudio.single('audio'),(req, res) => {
    let {eid} = req.body;
    console.log(req.files)
    res.send({"code": 200, "message": "Audio received successfully"})
})

// var app_image = multer.diskStorage({
//     destination:(req, file, cb)=>{
//         cb(null, "appAudio")
//     },
//     filename:(req, file, cb)=>{
//         cb()
//     }
// })



app.post('/appImage', (req, res) => {
    console.log(req)
    res.send({"code": 200, "message": "Backup Endpoint reached successfully"})
})

// app.listen(2000, () => {
//     console.log("Server runnnig on PORT 2000...")
// })
