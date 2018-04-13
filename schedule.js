var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ScheduleSchema = new Schema({
	_id: Number,
	schedule: [],
	createdAt: { type: Date, default: Date.now }
}, { _id: false });

module.exports = mongoose.model('Schedule', ScheduleSchema)