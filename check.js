var axios = require('axios')
var FormData = require('form-data')
var path = require('path')
var fs = require('fs')

let formto = new FormData();
formto.append(
    "speaker" , "Ram"
)
var curpath = path.join(__dirname,"/appAudio/4lSuvyi5DJs1nDOxasYxNE5B.wav")
console.log("PATH : ",curpath)
formto.append(
    "audio" ,{
        "value": fs.createReadStream(curpath),
        "options":{
            filename:"Sample.wav",
            contentType : null
        }
    }
)


 axios.post('http://192.169.43.224:2000/temp',form).then((res)=>{
    console.log(res)
 }).catch(err=>{
     console.log(err)
 })
