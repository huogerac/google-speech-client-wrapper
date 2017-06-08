// RecordRTC over Socket.io - https://github.com/muaz-khan/RecordRTC/tree/master/RecordRTC-over-Socketio
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    fsReader = require("fs"),
    uuid = require('node-uuid'),
    port = process.argv[2] || 9001;

console.log('http://localhost:' + port);

// Initialize Google Speech API
// in order to make google api works
// a key must be set
// export GOOGLE_APPLICATION_CREDENTIALS=../path/mykeyfile.json

const Speech = require('@google-cloud/speech');
const speech = Speech({
    projectId: 'arboreal-groove-169604'
});
// The encoding of the audio file, e.g. 'LINEAR16'
const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US';
const requestSpeech = {
    config: {
        encoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode
    },
    interimResults: false // If you want interim results, set this to true
    };

// Stream the audio to the Google Cloud Speech API
//const recognizeStream = speech.createRecognizeStream(requestSpeech)
//    .on('error', console.error);


var app = http.createServer(function (request, response) {

    var uri = url.parse(request.url).pathname,
        filename = path.join(process.cwd(), uri);

    fs.exists(filename, function (exists) {
        if (!exists) {
            response.writeHead(404, {
                "Content-Type": "text/plain"
            });
            response.write('404 Not Found: ' + filename + '\n');
            response.end();
            return;
        }

        if (fs.statSync(filename).isDirectory()) filename += '/index.html';

        fs.readFile(filename, 'binary', function (err, file) {
            if (err) {
                response.writeHead(500, {
                    "Content-Type": "text/plain"
                });
                response.write(err + "\n");
                response.end();
                return;
            }

            response.writeHead(200);
            response.write(file, 'binary');
            response.end();
        });
    });
}).listen(parseInt(port, 10));

var path = require('path'),
    exec = require('child_process').exec;

var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket) {

    //avoid to be initialize multiple times


    socket.on('message', function (data) {
        var fileName = uuid.v4();
        
        //socket.emit('ffmpeg-output', 0);


        console.log( 'typeof: ', typeof data.audio.dataURL );
        //data.audio.dataURL.pipe(recognizeStream);

        writeToDisk(data.audio.dataURL, fileName + '.wav', function(text) {
            console.log("--------------> [1] wav saved.");
            console.log('----------------[2] :', typeof text);

            //audioFile.pipe(recognizeStream);
            socket.emit('merged', text);
            //var audioBuffer = require("fs");
        //    audioBuffer.pipe(recognizeStream);
            //audioBuffer.createReadStream(filepath).pipe(recognizeStream);
        });

        //speechToText(data.audio.dataURL, function(text) {
        //    console.log("--------------> [2] ", text);
        //    socket.emit('merged', text);
        //});

        // if it is chrome
        //if (data.video) {
        //    writeToDisk(data.video.dataURL, fileName + '.webm');
        //    merge(socket, fileName);
        //}

        // if it is firefox or if user is recording only audio
        //else 
        //socket.emit('merged', fileName + '.wav');
    });
});

// isn't it redundant?
// app.listen(8888);

function writeToDisk(dataURL, fileName, callback) {
    var fileExtension = fileName.split('.').pop(),
        fileRootNameWithBase = './uploads/' + fileName,
        filePath = fileRootNameWithBase,
        fileID = 2,
        fileBuffer;

    // @todo return the new filename to client
    while (fs.existsSync(filePath)) {
        filePath = fileRootNameWithBase + '(' + fileID + ').' + fileExtension;
        fileID += 1;
    }
    console.log('---------------- 1:', typeof dataURL);

    dataURL = dataURL.split(',').pop();
    fileBuffer = new Buffer(dataURL, 'base64');

    //recognizeStream.on('data', (data) => {
    //  console.log('Transcription: ', data.results);
    //  callback(data.results);
    //});
    //var streamBuffers = require('stream-buffers');
    //var myReadableStreamBuffer = new streamBuffers.ReadableStreamBuffer();
    //myReadableStreamBuffer.on('data', function(data) {
    //    console.log('myReadableStreamBuffer---> data arrived');
    //});
    //myReadableStreamBuffer.put(fileBuffer);
    //myReadableStreamBuffer.stop();
    //myReadableStreamBuffer.pipe(recognizeStream);

    //fs.writeFileSync(filePath, fileBuffer);

    /*
    fs.writeFile(filePath, fileBuffer, function(err) {
        if (err) {
          console.log('error saving wav: ', err);
          return;
        }
        fs.close(filePath, function() {
            console.log("The file was saved!");
            var readStream = fsReader.createReadStream(filePath);
            callback(readStream);
        });
    });
    */

    fs.open(filePath, 'w', function(err, fd) {
        if (err) {
            throw 'error opening file: ' + err;
        }
        fs.write(fd, fileBuffer, 0, fileBuffer.length, null, function(err) {
            if (err) throw 'error writing file: ' + err;
            fs.close(fd, function() {
                console.log('file written');
                const requestS = {
                  encoding: 'LINEAR16',
                  sampleRateHertz: 44100,
                  languageCode: 'en-US'
                };
                speech.recognize(filePath, requestS)
                  .then((results) => {
                    const transcription = results[0];
                    console.log('Transcription: ', transcription);
                    callback(transcription);

                  }).catch((err) => {
                    console.error('ERROR:', err);
                });                
            });
        });
    });


    //var Readable = require('stream').Readable;
    //var dataURLStream = new Readable;
    //for (var i = 0; i < dataURL.length; i++) {
    //    dataURLStream.push(dataURL[i]);
    //}
    //dataURLStream.push(null); // EOF

    //console.log('---------------- 2:', typeof dataURLStream);

    //var audiofile = fs.createWriteStream(filePath, { encoding: 'base64' });
    //audiofile.on('error', function(err) { 
    //  console.log('error saving wav: ', err);
    //});
    
    //dataURL.forEach(function(v) {
    //audiofile.write(dataURLStream);
    //audiofile.end();

    //console.log('---------------- 3:', typeof audiofile);

    //callback(dataURLStream);
    //console.log('filePath', filePath);
}

function speechToText(dataURL, callback) {

    var streamifier = require('./node-stream');
    dataURL = dataURL.split(',').pop();
    streamifier.createReadStream(new Buffer (dataURL, 'base64')).pipe(recognizeStream);

}


/*
function merge(socket, fileName) {
    var FFmpeg = require('fluent-ffmpeg');

    var audioFile = path.join(__dirname, 'uploads', fileName + '.wav'),
        videoFile = path.join(__dirname, 'uploads', fileName + '.webm'),
        mergedFile = path.join(__dirname, 'uploads', fileName + '-merged.webm');

    new FFmpeg({
            source: videoFile
        })
        .addInput(audioFile)
        .on('error', function (err) {
            socket.emit('ffmpeg-error', 'ffmpeg : An error occurred: ' + err.message);
        })
        .on('progress', function (progress) {
            socket.emit('ffmpeg-output', Math.round(progress.percent));
        })
        .on('end', function () {
            socket.emit('merged', fileName + '-merged.webm');
            console.log('Merging finished !');

            // removing audio/video files
            fs.unlink(audioFile);
            fs.unlink(videoFile);
        })
        .saveToFile(mergedFile);
}
*/

