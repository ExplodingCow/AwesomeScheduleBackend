var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const mongoose = require("mongoose");
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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();

mongoose.connect(
	"mongodb://explodingdb:notpassword@ds255347.mlab.com:55347/schedule"
);
var Schedule = require("./schedule");
router.get("/", function(req, res) {
	res.json({ message: "This is the API for AwesomeSchedule. 👌" });
});

app.use("/api", router);

app.listen(port);
console.log("Running AwesomeSchedule Backend on port " + port + " 👌");

function loadConfig() {
	var config = JSON.parse(fs.readFileSync("data.json", "utf8"));
	if (config.schedule.renewXMLZIP === true) {
		console.log("[AwesomeSchedule] Checking for schedule updates");
		downloadZIPFile(config.schedule.savedSchedules[0].date);
	} else if (config.schedule.renewXMLZIP === false) {
		console.log(
			"[AwesomeSchedule] renewXMLZIP is set to *false*, therefore schedule will not be renewed."
		);
	}
}

//http://lms.apiit.edu.my/intake-timetable/download_timetable/timetableXML.zip
function downloadZIPFile(currentVersion) {
	console.log("[AwesomeSchedule] Downloading XML ZIP file from APU servers.");
	var wget = require("node-wget-promise");
	wget(
		"http://lms.apiit.edu.my/intake-timetable/download_timetable/timetableXML.zip"
	)
		.then(res => {
			console.log(res);
			console.log("[AwesomeSchedule] Download Complete! ");
			return unzipFile(currentVersion);
		})
		.catch(err => {
			console.log(err);
			console.log(
				"[AwesomeSchedule] Uh Oh! Failed to download the XML ZIP file from APU servers! 😡"
			);
		});
}

function unzipFile(currentVersion) {
	console.log("[AwesomeSchedule] Unzipping XML ZIP file");
	var inputFileName = "./timetableXML.zip";
	var extractToDirectory = "./timetableXML/";

	fs
		.createReadStream(inputFileName)
		.pipe(unzip.Extract({ path: extractToDirectory }));
	setTimeout(function() {
				checkFile(currentVersion);
			}, 3000);
}

function checkFile(currentVersion) {
	console.log(
		"[AwesomeSchedule] We'll need to obtain the name of the XML file."
	);
	glob("./timetableXML/*.xml", function(er, files) {
		if (files[0] == "./timetableXML/" + currentVersion + ".xml") {
			console.log(
				"[AwesomeSchedule] Looks like the schedule is still not updated. No further action will be taken."
			);
		} else if (files[0] != currentVersion + ".xml") {
			console.log("./timetableXML/" + currentVersion + ".xml")
			console.log(files[0])
			console.log(
				"[AwesomeSchedule] There's a new schedule update! Updating now."
			);
			setTimeout(function() {
				XML2JSON(files[0]);
			}, 1000);
		}
	});
}

function XML2JSON(locationOfFile) {
	console.log("[AwesomeSchedule] Converting XML to JSON format");
	var xml = fs.readFileSync(locationOfFile, "utf8");
	parseString(xml, function(err, result) {
		while (theJSON === undefined) {
			var theJSON = [result];
			return uploadToDB(theJSON);
		}
	});
}

function uploadToDB(theJSON) {
	console.log("[AwesomeSchedule] Uploading to DB.")
	var scheduleID = theJSON[0].weekof.$.week;
	scheduleID = scheduleID.replace(/-/g, "");
	var schedule = new Schedule();
	schedule._id = scheduleID;
	schedule.schedule = theJSON;
	schedule.save(function(err, schedule) {
		if (err) console.log(err);
		console.log("[AwesomeSchedule] Schedule uploaded to DB!");
		return updateConfig(theJSON[0].weekof.$.week, scheduleID)
	});
}

function updateConfig(newVersionDate, scheduleID) {
	console.log("[AwesomeSchedule] Updating the config file.")
	var newConfig = JSON.parse(fs.readFileSync("data.json", "utf8"));
	var newObject = { date: newVersionDate, id: scheduleID }
	newConfig.schedule.savedSchedules.push(newObject)
	fs.writeFileSync('data.json', JSON.stringify(newConfig));
	console.log("[AwesomeSchedule] Update Successful ✅")
}

function listData(scheduleID) {
	Schedule.findById(scheduleID, function(err, schedule) {
		if (err) console.log(err);
		console.log(scheduleID);
	});
}

loadConfig();

function testFind() {
	Schedule.findOne({'weekof.intake.$': {$elemMatch: {name: "AFCF1702AS"}}}, function (err, user) {
		console.log(user)
		})
}
	testFind()