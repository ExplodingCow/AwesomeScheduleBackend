var express = require("express");
var app = express();
var bodyParser = require("body-parser");
// fetch zip
var fs = require("fs");
var url = require("url");
var http = require("http");
var exec = require("child_process").exec;
var spawn = require("child_process").spawn;
var glob = require("glob");
// unzip
var unzip = require("unzip");
// XML2JS
const parseString = require("xml2js-parser").parseString;
var cron = require('node-cron');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();

router.get("/", function(req, res) {
    res.json({ message: "This is the API for AwesomeSchedule. 👌" });
});

app.use("/api", router);

app.listen(port);
console.log("Running AwesomeSchedule Backend on port " + port + " 👌");

cron.schedule('00 00 12 * * 1-7', function(){
  console.log("[AwesomeSchedule] It's 12AM, executing loadConfig function.");
});

function loadConfig() {

    // Load the files
    global.config = JSON.parse(fs.readFileSync("data.json", "utf8"));
    global.scheduleJSON = JSON.parse(fs.readFileSync("schedule.json", "utf8"));
    global.indexCache = JSON.parse(fs.readFileSync("index.json", "utf8"))
    global.listOfIntakes = JSON.parse(fs.readFileSync("listOfIntakes.json", "utf8"))

    if (global.config.schedule.renewXMLZIP === true) {
        console.log("[AwesomeSchedule] Checking for schedule updates");
        downloadZIPFile(global.config.schedule.savedSchedules[global.config.schedule.savedSchedules.length - 1]); // pass on current version date
    } else if (global.config.schedule.renewXMLZIP === false) {
        console.log(
            "[AwesomeSchedule] renewXMLZIP is set to *false*, therefore schedule will not be renewed."
        );
    }
}

function downloadZIPFile(currentVersion) {
    console.log("[AwesomeSchedule] Downloading the latest CSV ZIP file from APU servers.");
    var wget = require("node-wget-promise");
    wget(
        "http://lms.apiit.edu.my/intake-timetable/download_timetable/timetableCSV.zip"
    )
        .then(res => {
            console.log(res);
            console.log("[AwesomeSchedule] Download Complete! ");
            return unzipFile(currentVersion);
        })
        .catch(err => {
            console.log(err);
            console.log(
                "[AwesomeSchedule] Uh Oh! Failed to download the CSV ZIP file from APU servers! 😡"
            );
        });
}

function unzipFile(currentVersion) {
    console.log("[AwesomeSchedule] Unzipping CSV ZIP file");
    var inputFileName = "./timetableCSV.zip";
    var extractToDirectory = "./timetableCSV/";

    fs
        .createReadStream(inputFileName)
        .pipe(unzip.Extract({ path: extractToDirectory }));
    setTimeout(function() {
        checkFile(currentVersion);
    }, 2000);
}

function checkFile(currentVersion) {
    console.log(
        "[AwesomeSchedule] We'll need to obtain the name of the CSV file in order to proceed."
    );
    glob("./timetableCSV/*.csv", function(er, files) {
        if (
            files[files.length - 1] ==
            "./timetableCSV/" + currentVersion + ".csv"
        ) {
            console.log(
                "[AwesomeSchedule] Looks like the schedule is still not updated. No further action will be taken."
            );
        } else if (files[files.length - 1] != "./timetableCSV/" + currentVersion + ".csv") {
            console.log(
                "[AwesomeSchedule] There's a new schedule update! Updating now."
            );
            setTimeout(function() {
                CSV2JSON(files[files.length - 1]);
            }, 1000);
        }
    });
}

function CSV2JSON(locationOfNewCSV) {
    console.log("[AwesomeSchedule] Converting CSV to JSON format");
    var newVersionDate = locationOfNewCSV
        .replace("./timetableCSV/", "")
        .replace(".csv", "");
    var currentCSV = fs.readFileSync(locationOfNewCSV, "utf8");
    var fixCSV =
        "DATE,INTAKE_CODE,DATE,TIME,CAMPUS,ROOM,MODULE_CODE,LECTURER" +
        "\n" +
        currentCSV;
    fs.writeFileSync(locationOfNewCSV, fixCSV);
    const csv = require("csvtojson");
    csv()
        .fromFile(locationOfNewCSV)
        .on("end_parsed", function(jsonObj) {
            global.scheduleJSON[newVersionDate] = jsonObj
            fs.writeFileSync(
                "./timetableJSON/" + newVersionDate + ".json",
                JSON.stringify(jsonObj)
            );
            global.scheduleJSON[newVersionDate] = jsonObj
            fs.writeFileSync(
                "schedule.json",
                JSON.stringify(global.scheduleJSON)
            );
        });
    setTimeout(function() {
        return indexDB(newVersionDate);}, 1000);
}

function indexDB(newVersionDate) {
    console.log(
        "[AwesomeSchedule] Indexing the database to improve query speed"
    );
    var locationOfFile = "./timetableJSON/" + newVersionDate + ".json";
    var currentCSV = JSON.parse(fs.readFileSync(locationOfFile, "utf8"));
    var indexDB = {};
    var firstPos;
    var lastPos;
    var listOfIntakes = []
    var proceed = true;
    var intakeCode = currentCSV[0]["INTAKE_CODE"]; // first
    while (proceed === true) {
        var firstPos = currentCSV.map(function(e) {
                return e.INTAKE_CODE;
            }).indexOf(intakeCode);
        var lastPos = currentCSV
            .map(function(e) {
                return e.INTAKE_CODE;
            })
            .lastIndexOf(intakeCode);
        indexDB[intakeCode] = [firstPos, lastPos];
        listOfIntakes.push(intakeCode);
        var nextPos = lastPos + 1;
        if (nextPos == currentCSV.length) {
            var proceed = false;
        } else {
            var intakeCode = currentCSV[nextPos]["INTAKE_CODE"];
        }
    }
    var indexDBFileName = "./indexDB/" + newVersionDate + ".json";
    fs.writeFileSync(indexDBFileName, JSON.stringify(indexDB));
    global.indexCache[newVersionDate] = indexDB; // Set Global Index *
    fs.writeFileSync("index.json", JSON.stringify(global.indexCache))
    console.log("[AwesomeSchedule] Database index constructed.");
    return genListOfIntakes(listOfIntakes, newVersionDate)
    //return updateConfig(newVersionDate);
}

function genListOfIntakes(listOfIntakes, newVersionDate) {
    console.log("[AwesomeSchedule] Generating a list of intakes.")
    var listOfIntakesFile = 'listOfIntakes.json'
    global.listOfIntakes = listOfIntakes
    fs.writeFileSync(listOfIntakesFile, JSON.stringify(listOfIntakes));
    return updateConfig(newVersionDate)
}

function updateConfig(newVersionDate) {
    console.log("[AwesomeSchedule] Updating the config file.");
    global.config.schedule.savedSchedules.push(newVersionDate);
    fs.writeFileSync("data.json", JSON.stringify(global.config))
    console.log("[AwesomeSchedule] Update Successful ✅");
}

loadConfig();

// List classes
    router
    .route("/schedules/:date/:intake_code")

    .get(function(req, res) {
        var selectedIntake = req.params.intake_code;
        var selectedDate = req.params.date;
        console.log("Query for " + selectedIntake + " for " + selectedDate)
        if (global.indexCache[selectedDate] === undefined) {
            res.json({ message: "Date not in database"})
        }
        else if (global.indexCache[selectedDate][selectedIntake] === undefined) {
            res.json({ message: "Intake not found in database"})
        }
        else {
        var indexRange = global.indexCache[selectedDate][selectedIntake];
        var schedule = global.scheduleJSON[selectedDate].slice(indexRange[0], indexRange[1] + 1)
        res.json(schedule);
        }
    });

// List intakes currently available
    router.route("/intakes/list").get(function(req, res) {
        res.json(global.listOfIntakes)
    })
