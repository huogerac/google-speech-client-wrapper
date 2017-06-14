/**
* Totally based on
* https://github.com/muaz-khan/RecordRTC/tree/master/RecordRTC-over-Socketio
*/

const PORT = 9001;

var WebRTCServer = {};

var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    fsReader = require("fs"),
    uuid = require('node-uuid');
var debug = require('debug')('webrtc');

var path = require('path'),
    exec = require('child_process').exec;

var googleSpeechAPI = require("./googlespeechcontroller");

var app;
var io;


/*

 */
WebRTCServer.startWebHttpServer = function() {

  app = http.createServer(function (request, response) {

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
  }).listen(PORT);

};


WebRTCServer.startSockets = function() {
  var that = this;
  io = require('socket.io').listen(app);

  io.sockets.on('connection', function (socket) {

    //avoid to be initialize multiple times
    socket.on('message', function (data) {
      var fileName = uuid.v4();
      var fileBuffer = Buffer.from(data.buffer);
      // For some reason a 0x04 is prepended to the stream. 
      // we remove it here to fix the file format
      fileBuffer = fileBuffer.slice(1);
      console.log("Sending %d bytes.", fileBuffer.length);
      return googleSpeechAPI.bufferToText(fileBuffer).then(function(text){
        socket.emit('transcript', text[0]);
      });
      // NOTE: We don't really need to write anything to disk, but I leave this
      // here just in case you want to review the audio.

      // that.writeBufferToDisk(data.buffer, fileName + '.wav', function(text){
      //   socket.emit('transcript', text);
      // });
    });
  });

};

WebRTCServer.writeBufferToDisk = function(dataBuffer, fileName, callback){
  var filePath = './uploads/' + fileName;
  
  fs.open(filePath, 'w', function(err, fd) {
    if (err) {
        throw 'error opening file: ' + err;
    }
    console.log("Writing buffer: ", dataBuffer);
    fs.write(fd, dataBuffer, 0, dataBuffer.length, null, function(err) {
      if (err) throw 'error writing file: ' + err;
      fs.close(fd, function() {
        console.log('file written');
        googleSpeechAPI.fileToText(filePath, function(transcription) {
          callback(transcription);
        });
      });
    });
  });
};



WebRTCServer.startApi = function() {

  // Initiates web server
  this.startWebHttpServer();
  console.log('    > web started ');

  this.startSockets();
  console.log('    > Sockets started ');

  return true;

};


WebRTCServer.stopApi = function() {

  io.close();
  console.log('[x] Socket stopped');

  app.close();
  console.log('[x] Web stopped');
  return true;
};


module.exports = WebRTCServer;
