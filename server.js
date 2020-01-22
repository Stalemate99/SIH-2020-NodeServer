let express = require('express')
const path = require("path")
const fs = require("fs");
const request = require("request")
let FormData = require('form-data');
let bodyParser = require('body-parser')
let multer = require('multer')
const User = require('./schema')
const axios = require("axios")

var glo = 0;
// const axios
// const multipart = require('connect-multiparty')

const Location = {  // assumption
    lat: 12.7515547,
    long: 80.1968071
}

let app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
// app.use(multipart())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "*");
    next(); 
  });
let server = app.listen(process.env.PORT||2000)
let io = require('socket.io').listen(server)

let Service = require('./service.js')

app.get("/", (req, res) => {
    res.send("hi there");
})

io.on('connection',(socket)=>{
    console.log("Socket Connected!")
    // socket.emit('Attendance',"connect please")
})

//Resgistering Employees image----------------------------------

const reg_img = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null, "asset/regImg")
    },
    filename:(req, file, cb)=>{
        cb(null, "Face.jpg")
    }
})

const regImg = multer({
    storage:reg_img,
})


app.post('/registerImage', regImg.single("image"),(req, res) => {

    let curpath = path.join(__dirname,"/asset/regImg/Face.jpg");
    console.log(req.body["eid"],curpath);
    let formData = {
    target: req.body.eid,
    face_image: fs.createReadStream(curpath)
    };
    glo++;
    console.log("SENDING COUNT :: ",glo)
    request.post({
        url: 'http://192.168.43.128:5000/addFace',
        formData: formData
     }, function optionalCallback(err, httpResponse, body) {
    if (err) {
        return console.error('upload failed:', err);
    }
    console.log('Upload successful!  Server responded with:', body);
    
    })
})


//Resgistering Employees image----------------------------------

//Resgistering Employees Audio----------------------------------

const reg_audio = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null, "asset/regAudio")
    },
    filename:(req, file, cb)=>{
        console.log("multer",file.originalname);
        switch(file.originalname){
            case "audio1.mp3":
                cb(null, file.originalname);
                break;
            case "audio2.mp3":
                cb(null, file.originalname);
                break;
            case "audio3.mp3":
                cb(null, file.originalname);
                break;
            case "audio4.mp3":
                cb(null, file.originalname);
                break;
            case "audio5.mp3":
                cb(null, file.originalname);
                break;
            default :
                cb(null, "babes.mp3");             

        }
    }
})

const regAudio = multer({
    storage:reg_audio,
})

app.post("/registerAudio",regAudio.fields([{ name:"audio1"},{name:"audio2"},{name:"audio3"},{name:"audio4"},{name:"audio5"}]),async (req,res) => {
    let arr = ["audio1.mp3","audio2.mp3","audio3.mp3","audio4.mp3","audio5.mp3"]
    try{
        let curpath = path.join(__dirname,"/asset/regAudio/");
        let a1 = await SendFiles(arr,curpath,req.body["eid"])
        // let a2 = await SendFiles(curpath+"audio2.mp3",req.body["eid"])
        // let a3 = await SendFiles(curpath+"audio3.mp3",req.body["eid"])
        // let a4 = await SendFiles(curpath+"audio4.mp3",req.body["eid"])
        // let a5 = await SendFiles(curpath+"audio5.mp3",req.body["eid"])

    
        registerDb(req.body["name"],req.body["eid"])
    }
    catch(err){
        console.log(err)
    }
})


//Resgistering Employees Audio----------------------------------




app.get('/getUsers', async(req, res) => {
    let key = new Date().toLocaleDateString()
    let usr = await User.find({})
    if (!usr) {
        return res.send({"code": 400, "message": "No users obtained"})
    }
    console.log(usr)
    let newUsrBase = usr.filter(ele=>{
        return ele.attendanceParams[key]
    })
    res.send({body : newUsrBase})
})

app.get('/getUser', async(req, res) => {
    console.log(req.query)
    let eid = req.query.eid
    let key = req.query.date
    let usr = await User.findOne({eid})
    if (!usr) {
        return res.send({"code": 400, "message": "No users obtained"})
    }
    else{
        if(usr.attendanceParams[key].attendance){
            res.send({attendance : true})
        }
    }
    res.send(res.send({attendance : false}))
})



// Audio ------------------------------------------------------------------

const upload_audio = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null, "asset/appAudio")
    },
    filename:(req, file, cb)=>{
        cb(null, "Sample.wav")
    }
})

const uploadAudio = multer({
    storage:upload_audio,
})

app.post('/appAudio', uploadAudio.single('audio'),(req, res) => {
    let curpath = path.join(__dirname,"/asset/appAudio/Sample.wav");
    console.log(req.body["eid"],curpath," Lat:",req.body["lat"]," Long",req.body["long"]);
    if(convertToM(Location.lat,Location.long,req.body["lat"],req.body["long"]) <= 500 ){
        let formData = {
            speaker: req.body.eid,
            audio_file: fs.createReadStream(curpath)
            };
            glo++;
            console.log("SENDING COUNT :: ",glo)
            request.post({
                url: 'http://192.168.43.128:5000/findSpeaker',
                formData: formData
             }, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            console.log('Upload successful! ll Server responded with:', body);
            
            res.send(body);
            updateDb(req.body["eid"],req.body["timestamp"]);

            // if(body["result"]){
            //     console.log("inside ready ro update")
            //     updateDb(req.body["eid"],req.body["timestamp"]);
            //     res.send({valid:true});
            // } else{
            //     console.log("Not inside ready ro update")
            //     res.send({valid:false})
            // }
        });

    } else{
        res.send({valid:false})
    }
    
})


// Audio ------------------------------------------------------------------


// Image------------------------------------------------------------------

const upload_image = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null, "asset/appImage")
    },
    filename:(req, file, cb)=>{
        cb(null, "Face.jpg")
    }
})

const uploadImage = multer({
    storage:upload_image,
})


app.post('/appImage',uploadImage.single("image") ,(req, res) => {
    // console.log(req)

    let curpath = path.join(__dirname,"/asset/appImage/Face.jpg");
    console.log(req.body["eid"],curpath,req.body["timestamp"]," Lat:",req.body["lat"]," Long",req.body["long"]);
    if(convertToM(Location.lat,Location.long,req.body["lat"],req.body["long"]) <= 500 ){
        let formData = {
            target: req.body.eid,
            face_image: fs.createReadStream(curpath)
            };
            glo++;
            console.log("SENDING COUNT :: ",glo)
            request.post({
                url: 'http://192.168.43.128:5000/findFace',
                formData: formData
             }, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            console.log('Upload successful!  Server responded with:', body);
            //
            if(body.result == 1){
                updateDb(req.body["eid"],req.body["timestamp"]);
                res.send({valid:true});
            } else{
                res.send({valid:false});
            }
            });

    }else{
        res.send({valid:false});
    }
})

// Image------------------------------------------------------------------


// Utils--------------------------------------------------------------------

async function updateDb(eid,timestamp){
    let key = new Date().toLocaleDateString();
    let updUsr = await User.findOne({eid})
    updUsr.attendanceParams[key] = {
        timestamp,
        attendance: true
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
            console.log("successful update XD ::  ",replaceUsr)
            io.sockets.emit('changeAttendance',replaceUsr)
            return null
        })
        .catch(err => {
            console.log(err)
        })
}

function registerDb(name,eid){
    
    //Sending Info to DB
    // let key = new Date().toLocaleDateString()
    let key = "start"
    let timestamp = new Date().toLocaleTimeString()
    const newUser = new User({name, eid, attendanceParams:{}});
    newUser.attendanceParams[key] = {
        timestamp,
        attendance : true
    };
    console.log("USER REGISTER? :: ",newUser)
    newUser
        .save()
        .then(() => {
            console.log("success")
            return null
        })
        .catch(err => {
            console.log(err)
        });
        return null

}

async function SendFiles(arr,curpath,eid){
    let formData = {
    speaker: eid,
    audio_file1: fs.createReadStream(curpath+arr[0]),
    audio_file2: fs.createReadStream(curpath+arr[1]),
    audio_file3: fs.createReadStream(curpath+arr[2]),
    audio_file4: fs.createReadStream(curpath+arr[3]),
    audio_file5: fs.createReadStream(curpath+arr[4]),
    };
    glo++;
    console.log("SENDING COUNT :: ",glo)
    request.post({
        url: 'http://192.168.43.128:5000/addSpeaker',
        formData: formData
     }, function optionalCallback(err, httpResponse, body) {
    if (err) {
        return console.error('upload failed:', err);
    }
    console.log('Upload successful!  Server responded with:', body);
    return body
    })
    return null
}

function convertToM(lat, long, lat1, long1) { //Math function to calculate Distance between two nodes in metres

    function toRadians(l) {
        return (Math.PI * l) / 180;
    }

    let R = 6371e3;
    let φ1 = toRadians(lat);
    let φ2 = toRadians(lat1);
    let Δφ = toRadians((lat1 - lat));
    let Δλ = toRadians((long1 - long));
    let a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;

    return d;

};