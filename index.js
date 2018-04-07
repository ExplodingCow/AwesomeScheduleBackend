var express = require("express");
var app = express();
var bodyParser = require("body-parser");
// fetch zip
var fs = require("fs");
var url = require("url");
var http = require("http");
var exec = require("child_process").exec;
var spawn = require("child_process").spawn;
// unzip
var unzip = require("unzip");
// XML2JS
var parseString = require("xml2js").parseString;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();

router.get("/", function(req, res) {
	res.json({ message: "This is the API for AwesomeSchedule." });
});

app.use("/api", router);

app.listen(port);
console.log("Running AwesomeSchedule Backend on port " + port);

//var mongoose = require("mongoose");

//mongoose.connect("mongodb:/heroku:heroku123@ds135619.mlab.com:35619/timetable");

//var Schedule = require("./schedule");

// START DOWNLOAD ** | Files will be downloaded to ./timetableXML/timetableXML.zip
async function download() {
	try {
	var file_url =
		"http://lms.apiit.edu.my/intake-timetable/download_timetable/timetableXML.zip";
	var DOWNLOAD_DIR = "./timetableXML/";
	var mkdir = "mkdir -p " + DOWNLOAD_DIR;
	var child = exec(mkdir, function(err, stdout, stderr) {
		if (err) throw err;
		else download_file_httpget(file_url);
	});
	var download_file_httpget = function(file_url) {
		var options = {
			host: url.parse(file_url).host,
			port: 80,
			path: url.parse(file_url).pathname
		};
		var file_name = url
			.parse(file_url)
			.pathname.split("/")
			.pop();
		var file = fs.createWriteStream(DOWNLOAD_DIR + file_name);

		http.get(options, function(res) {
			res
				.on("data", function(data) {
					file.write(data);
				})
				.on("end", function() {
					file.end();
					console.log(file_name + " downloaded to " + DOWNLOAD_DIR);
				});
		});
	};
}
catch (err) {
	console.log(err)
}
}
// END DOWNLOAD **

// START UNZIP
async function unzipd() {
	try {
		var inputFileName = "./timetableXML/timetableXML.zip";
		var extractToDirectory = "./timetableXML/";

		fs.createReadStream(inputFileName).pipe(
			unzip.Extract({
				path: extractToDirectory
			})
		);
	} catch (err) {
		console.log(err);
	}
}
// END UNZIP

// START XML TO JSON CONVERSION
// Lets read the XML file
var scheduleJSON = undefined;
async function convert() {
	try {
	var sInputFile = "timetableXML/2018-04-16.xml";
	var xml = fs.readFileSync(sInputFile, "utf8");
	// Now Convert
	parseString(xml, function(err, result) {
		var scheduleJSON = result;
	});
	// END XML TO JSON CONVERSION
	// Add new schedule to database
	console.log(scheduleJSON);
}
catch (err) {
	console.log(err)
}
}

async function run() {
	try {
	await download();
	await unzipd();
	await convert();
}
catch (err) {
	console.log(err)
}
}

run();
/*
var schedule = new Schedule();
schedule.weekof = readyJSON.weekof
place.description = req.body.description;
place.country = req.body.country;
for (i = 0; i < 10; i++) {
	place.reviews.push({
		name: req.body.reviewName,
		comment: req.body.reviewComment,
		rating: req.body.reviewRating
	});
}
*/

/*// place.save()
place.save(function(err) {
	if (err) res.send(err);

	res.json({ message: "Place created!" });
});

// List places
router.route("/schedule").get(function(req, res) {
	Place.find(function(err, places) {
		if (err) res.send(err);
		res.json(places);
	});
});

// Get place info by ID
router
	.route("/schedule/:schedule_id")

	.get(function(req, res) {
		Place.findById(req.params.schedule_id, function(err, place) {
			if (err) res.send(err);
			res.json(place);
		});
	});

// Delete place
router.route("/schedule/:schedule_id").delete(function(req, res) {
	Place.remove({ _id: req.params.schedule_id }, function(err, place) {
		if (err) res.send(err);
		res.json({ message: "Successfully deleted" });
	});
});
*/
