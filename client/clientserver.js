/**
* Simply serves the index.html
* TODO:
* - Use express instead, much simpler to provite a html
*/

const PORT = 9002;

var WebClientServer = {};

var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs");

var debug = require('debug')('webclient');

var app;
var io;

WebClientServer.startWebClientServer = function() {

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


WebClientServer.startClient = function() {

  // Initiates web server
  this.startWebClientServer();
  console.log('    > Index.html avaible on: ', PORT);
  return true;

};

module.exports = WebClientServer;
