var express = require("express");
var app = express();
var bodyParser = require("body-parser");
// fetch zip
var fs = require("fs");
var url = require("url");
var http = require("http");
var exec = require("child_process").exec;
var spawn = require("child_process").spawn;
var request = require("request");
// unzip
var yauzl = require("yauzl");
// XML2JS
var parseString = require("xml2js").parseString;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();
var download = require("download-file");

router.get("/", function(req, res) {
    res.json({ message: "This is the API for AwesomeSchedule." });
});

app.use("/api", router);

app.listen(port);
console.log("Running AwesomeSchedule Backend on port " + port);

//http://lms.apiit.edu.my/intake-timetable/download_timetable/timetableXML.zip
function downloadZIPFile() {
    console.log("Start Download!");
    var url = "http://lms.apiit.edu.my/intake-timetable/download_timetable/timetableXML.zip";

    var options = {
        directory: "./timetableXML/",
        filename: "timetableXML.zip",
        timeout: 90000
    };

    download(url, options, function(err) {
        if (err) throw err;
        console.log("meow");
    });
}

function notifyConsole() {
    console.log("Download Complete!");
    return unzipFile();
}

function unzipFile() {
    yauzl.open(
        "./timetableXML/timetableXML.zip",
        { lazyEntries: true },
        function(err, zipfile) {
            if (err) throw err;
            zipfile.readEntry();
            zipfile.on("entry", function(entry) {
                if (/\/$/.test(entry.fileName)) {
                    // Directory file names end with '/'.
                    // Note that entires for directories themselves are optional.
                    // An entry's fileName implicitly requires its parent directories to exist.
                    zipfile.readEntry();
                } else {
                    // file entry
                    zipfile.openReadStream(entry, function(err, readStream) {
                        if (err) throw err;
                        readStream.on("end", function() {
                            zipfile.readEntry();
                        });
                        readStream.pipe(somewhere);
                    });
                }
            });
        }
    );

    console.log("Done!");
    return XML2JSON();
}

async function XML2JSON() {
    var sInputFile = "timetableXML/2018-04-16.xml";
    var xml = await fs.readFileSync(sInputFile, "utf8");
    // Now Convert
    await parseString(xml, function(err, result) {
        var scheduleJSON = result;
    });
    // END XML TO JSON CONVERSION
    // Add new schedule to database
    console.log(scheduleJSON);
    var requireXML2JSONConversion = false;
}

/*
function runAll() {
new Promise(function(fulfill, reject){
    downloadZIPFile()
    fulfill(result);
}).then(function(result){
    return new Promise(function(fulfill, reject){
        unzipFile()
        fulfill(result);
    });
}).then(function(result){
    return new Promise(function(fulfill, reject){
        XML2JSON();
        fulfill(result);
    });
}).then(function(result){
    console.log(result)
});
}
*/

downloadZIPFile();
