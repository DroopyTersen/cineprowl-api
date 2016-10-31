var fs = require("fs"),
    http = require("http"),
    url = require("url"),
    path = require("path");

http.createServer(function (req, res) {
  if (req.url != "/movie.mp4") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end('<video src="http://localhost:8888/movie.mp4" controls></video>');
  } else {
    var file = path.resolve(__dirname,"movie.mp4");
    var range = req.headers.range;
    var positions = range.replace(/bytes=/, "").split("-");
    var start = parseInt(positions[0], 10);

    fs.stat(file, function(err, stats) {
      var total = stats.size;
      var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
      var chunksize = (end - start) + 1;

      res.writeHead(206, {
        "Content-Range": "bytes " + start + "-" + end + "/" + total,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4"
      });

      var stream = fs.createReadStream(file, { start: start, end: end })
        .on("open", function() {
          stream.pipe(res);
        }).on("error", function(err) {
          res.end(err);
        });
    });
  }
}).listen(8888);

var express = require('express'),
  ffmpeg = require('fluent-ffmpeg');
var fs = require("fs"),
    http = require("http"),
    url = require("url"),
    path = require("path");
var droopyHttp = new(require("droopy-http"))();
var spawn = require('child_process').spawn;

var app = express();

app.use(express.static(__dirname + '/flowplayer'));

app.get('/', function(req, res) {
  res.send('index.html');
});
var command = null;
app.get("/stream/:id", function(req, res) {
  console.log("Request");
  droopyHttp.getJSON("http://api.cineprowl.com/movies/" + req.params.id)
    .then(function(movie) {
      var file = movie.file.filepath;
      console.log(file);
      var range = req.headers.range;
      console.log(req.headers);
      var positions = range.replace(/bytes=/, "").split("-");
      var start = parseInt(positions[0], 10);

      fs.stat(file, function(err, stats) {
        var total = stats.size;
        var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        var chunksize = (end - start) + 1;
        console.log(total);
        console.log(chunksize);

        res.writeHead(206, {
          "Content-Range": "bytes " + start + "-" + end + "/" + total,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": "video/flv"
        });
        //console.log(start);
        //console.log(end);
        var stream = fs.createReadStream(file, { start: start, end: end });
        if (command) console.log(command)

        command = ffmpeg(stream)
        // use the 'flashvideo' preset (located in /lib/presets/flashvideo.js)
        .preset('flashvideo')
        // setup event handlers
        .on('end', function() {
          console.log('file has been converted succesfully');
        })
        .on('error', function(err) {
          console.log('an error happened: ' + err.message);
        })
        // save to stream
        .pipe(res, {end:true});  
          // .on("open", function() {
          //   stream.pipe(res);
          // }).on("error", function(err) {
          //   res.end(err);
          // });
       });
    });

});

app.listen(4000);