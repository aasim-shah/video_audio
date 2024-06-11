

const express = require('express');
const bodyParser = require('body-parser');
const functions = require('firebase-functions');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const { spawn } = require('child_process'); // Importing spawn from child_process
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');

app.use(express.static("public"))
app.use(express.json());
app.use(express.urlencoded({extended : true}))

const ffmpegPath = require('ffmpeg-static');


ffmpeg.setFfmpegPath(ffmpegPath);


// npm install assemblyai




// Convert milliseconds to HH:MM:SS format



// const client = new AssemblyAI({
//   apiKey: "579ae1e5799643d5af3f1dbfed32b408"
// })

// const audioUrl =
//   'https://storage.googleapis.com/aai-web-samples/5_common_sports_injuries.mp3'

// const config = {
//   audio_url: audioUrl
// }

// const run = async () => {
//   const transcript = await client.transcripts.transcript(config)

//   console.log(transcript.subtitle)
// }




function convertVideoToAudio(videoPath, outputPath) {
  ffmpeg(videoPath)
    .noVideo()
    .audioCodec('libmp3lame')
    .audioBitrate('192k')
    .save(outputPath)
    .on('end', () => {
      console.log('Conversion successful');
    })
    .on('error', (err) => {
      console.error('Conversion failed: ', err.message);
    });
}

// const videoPath = path.resolve(__dirname, "uploads/1717736280985-1000030274.mp4");
// const outputPath = path.resolve(__dirname, 'output/output.mp3');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Configure Multer to accept multiple fields
const upload = multer({ storage: storage }).fields([
  { name: 'video', maxCount: 1 },
]);

app.post('/process-video', upload, (req, res) => { 
  console.log("Api Called");
  try{

    

console.log(req.files);
  
    const videoPath = "./public/uploads/" +  req.files['video'][0].filename;

    console.log({videoPath})
    if (!fs.existsSync(videoPath)) {
      return res.status(400).send('Video file does not exist');
    }
    
    const outputPath = `output/${Date.now()}.mp3`;
  
    ffmpeg(videoPath)
      .noVideo()
      .audioCodec('libmp3lame')
      .audioBitrate('192k')
      .save(outputPath)
      .on('end', () => {
        res.download(outputPath, (err) => {
          if (err) {
            console.error('Error sending file:', err);
            res.status(500).send('Error converting video to audio');
          } else {
            // Clean up uploaded files
            fs.unlinkSync(videoPath);
            fs.unlinkSync(outputPath);
          }
        });
      })
      .on('error', (err) => {
        console.error('Conversion failed:', err.message);
        res.status(500).send('Error converting video to audio');
      });

    // const command = 'ffmpeg';
    // const args = ['-i', videoPath, '-vf', `subtitles=${subtitlePath}`, '-c:a', 'copy', outputFilePath];
    // console.log("runnning api");

    // const ffmpegProcess = spawn(command, args);

    // console.log("waiting api state");
    // res.send({
    //   "message":'runnning'
    // });
    // ffmpegProcess.stdout.on('data', (data) => {
    //   console.log(`stdout: ${data}`);
    // });
  
    // ffmpegProcess.stderr.on('data', (data) => {
    //   console.error(`stderr: ${data}`);
    // });
  }catch(e){
    console.log(e);
  }
    // res.download(outputPath, (err) => {
    //   if (err) {
    //     console.error(`Error: ${err.message}`);
    //   }

    //   // Clean up temporary files
    //   fs.unlink(videoPath, (err) => {
    //     if (err) console.error(err);
    //   });
    //   fs.unlink(subtitlePath, (err) => {
    //     if (err) console.error(err);
    //   });
    //   fs.unlink(outputPath, (err) => {
    //     if (err) console.error(err);
    //   });
    // });
});

app.get('/',(req,res)=> {
console.log("here is running");
return res.send("server is running !");  
});
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}/`);
// });


























// // Requiring module
// const express = require('express');
// const mongoose = require("mongoose");
// const { loginUser,registerUser,continue_with_google } = require('./controller/auth_controller/auth'); // Adjust the path as necessary
// const jwt = require('jsonwebtoken');

// // const Posts = require("./Models/posts_model");
// const multer = require('multer');
// // const controller  = require('/controller/auth_controller'); // Import the book controller
// module.exports = {
//   loginUser,
//   registerUser,
//   continue_with_google,
// };

// const app = express();
// app.use(express.json())
// app.use(express.static('/Public'));
// app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded




 
// mongoose.connect("mongodb+srv://officalabdulmalik2:peshawar123@cluster0.7g1ejrk.mongodb.net/?retryWrites=true&w=majority").then(res => console.log("db is wokring"));

// // adding images  using multer
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//       cb(null, 'public/');
//   },
//   filename: function (req, file, cb) {
//       cb(null, Date.now() + "_" + file.originalname);
//   },
// });

// // uplading images multer intance
// // var upload = multer({ storage: storage })


// // app.post("/dummy",upload.fields([{}]))

// // app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {

// //   try {

// //     const file = req.file

// //     console.log(file);

// //     if(!file){
// //       res.json({
// //         "Staus":false,
// //         "message":"Please add file"
// //       })
// //     }else {
// //       res.json({
// //         "Staus":true,
// //         "message":"File Uploaded"
// //       })
// //     } 
// //   } catch (error) {
// //     res.send(error.message);
// //   }

// // })









// // // Handling GET request
// // app.get('/getAPi/:userId',  async (req, res) => {
// //  try{
// //   const user  = await User.findById(req.params.userId)

// // console.log(user);


// // return res.json({
// //     sucess: true,
// //     body: user,
// //   })
// //  }catch(Error){
// //   res.send(Error.message)
// //  }
// // });

// // // Port Number
const PORT = process.env.PORT || 5000;




// // app.put('/updateuser' ,  async(req ,res) =>{
// //   try {
// //     const image = req.file
// //     const {user_id , fullname , email , phone} = req.body
// //     const user = await User.findById(user_id)


// //   user.fullName = fullname
// //   user.email = email
// //   user.image = req.file.filename



// // const updatedUser =   await user.save()


// //     res.send(updatedUser)
// //   } catch (error) {
// //     res.send(error.message)
// //   } 
// // })

// // var http = require('http');

// // http.createServer(function (req, res) {
// //     res.writeHead(200, {'Content-Type': 'text/html'});
// //     res.end('Hello World!');
// //   }).listen(8080);



app.listen(PORT, () => {
  console.log('server is running');
})











//  app.post('/login', (req,res)=> {
//   console.log(req.body);
//   loginUser(req,res);
//  });
//  app.post('/register', registerUser);



// //  app.post("/continue_with_google",  continue_with_google)

// exports.api = functions.https.onRequest(app);
