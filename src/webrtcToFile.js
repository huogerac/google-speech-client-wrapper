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
      console.log( 'typeof: ', typeof data.audio.dataURL );
      that.writeToDisk(data.audio.dataURL, fileName + '.wav', function(text) {
        console.log("--------------> [1] wav saved.");
        socket.emit('merged', text);
      });

    });
  });

};

WebRTCServer.writeToDisk = function(dataURL, fileName, callback) {

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

  fs.open(filePath, 'w', function(err, fd) {
    if (err) {
        throw 'error opening file: ' + err;
    }
    fs.write(fd, fileBuffer, 0, fileBuffer.length, null, function(err) {
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
