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
var glob = require("glob");
// unzip
var unzip = require("unzip");
// XML2JS
const parseString = require("xml2js-parser").parseString;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();
var download = require("download-file");
var progress = require("request-progress");

var Promise = require("bluebird");
var cmd = require("node-cmd");

router.get("/", function(req, res) {
    res.json({ message: "This is the API for AwesomeSchedule." });
});

app.use("/api", router);

app.listen(port);
console.log("Running AwesomeSchedule Backend on port " + port);

//http://lms.apiit.edu.my/intake-timetable/download_timetable/timetableXML.zip
function downloadZIPFile() {
    console.log("---- Downloading XML ZIP file from APU servers ----");
    var wget = require("node-wget-promise");
    wget(
        "http://lms.apiit.edu.my/intake-timetable/download_timetable/timetableXML.zip"
    )
        .then(res => {
            console.log(res);
            return unzipFile();
            console.log("Done!");
        })
        .catch(err => {
            console.log(err);
            console.log("Uh Oh! Failed to download the XML ZIP file from APU servers!");
        });
}

function unzipFile() {
    console.log("---- Start Unzip of XML ZIP file ----");
    var inputFileName = "./timetableXML.zip";
    var extractToDirectory = "./timetableXML/";

    fs
        .createReadStream(inputFileName)
        .pipe(unzip.Extract({ path: extractToDirectory }));
    setTimeout(checkFile, 3000);
}

function checkFile() {
    console.log("---- Obtaining the name of the XML file ----");
    glob("./timetableXML/*.xml", function(er, files) {  
    });
    var locationOfFile = files[0]
    setTimeout(XML2JSON, 9000);
}

function XML2JSON() {
    console.log("Start XML2JSON");
    var xml = fs.readFileSync(locationOfFile, "utf8");
    // Now Convert
    parseString(xml, function(err, result) {
        while (theJSON === undefined) {
            var theJSON = result;
            console.log(theJSON);
        }
    });
    // END XML TO JSON CONVERSION
    // Add new schedule to database
}

function runAll() {
    downloadZIPFile()
}

runAll();
