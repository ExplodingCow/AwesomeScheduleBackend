var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var weekSchema = new Schema( { "-week": Date } )
var timetableSchema = new Schema( { date: Date, time: Date, location: String, classroom: String, module: String, lecturer: String } )
var intakeSchema = new Schema( { "-name": String, timetable: [timetableSchema] } )

var ScheduleSchema = new Schema({
	weekof: [weekSchema],
	intake: [intakeSchema],
	categories: [],
	createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Schedule', ScheduleSchema)