var fs = require('fs');
var start = function (server, movieService) {
    server.get("/stream/:id", function (req, res) {
        console.log("Request");
        movieService.getById(req.params.id)
            .then(function (movie) {
                var file = movie.file;
                if (file) {
                    playFile(file, req, res);
                }
            });
    })
};

var playFile = function(file, req, res) { 
    var range = req.headers.range;
    var positions = range ?  range.replace(/bytes=/, "").split("-") : [0];
    var start = parseInt(positions[0], 10);

    fs.stat(file.filepath, function(err, stats) {
      var total = stats.size;
      var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
      var chunksize = (end - start) + 1;

      res.writeHead(206, {
        "Content-Range": "bytes " + start + "-" + end + "/" + total,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/" + file.extension
      });

      var stream = fs.createReadStream(file.filepath, { start: start, end: end })
        .on("open", function() {
          stream.pipe(res);
        }).on("error", function(err) {
          res.end(err);
        });
    });
}
module.exports = { start: start };