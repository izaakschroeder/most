/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var Sink = require('../sink/Pipe');
var CompoundDisposable = require('../disposable/CompoundDisposable');
var PropagateTask = require('../scheduler/PropagateTask');

/**
 * Limit the rate of events by suppressing events that occur too often
 * @param {Number} period time to suppress events
 * @param {Stream} stream
 * @returns {Stream}
 */
function throttle(period, stream) {
	return new Stream(new Throttle(period, stream.source));
}

function Throttle(period, source) {
	this.dt = period;
	this.source = source;
}

Throttle.prototype.run = function(sink, scheduler) {
	return this.source.run(new ThrottleSink(this.dt, sink), scheduler);
};

function ThrottleSink(dt, sink) {
	this.time = 0;
	this.dt = dt;
	this.sink = sink;
}

ThrottleSink.prototype.event = function(t, x) {
	if(t >= this.time) {
		this.time = t + this.dt;
		this.sink.event(t, x);
	}
};

ThrottleSink.prototype.end   = function(t, e) {
	return Sink.prototype.end.call(this, t, e);
};

ThrottleSink.prototype.error = Sink.prototype.error;

module.exports = throttle;
