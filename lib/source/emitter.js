/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var pull = require('lodash/array/pull');
var bindAll = require('lodash/function/bindAll');
var assign = require('lodash/object/assign');
var pick = require('lodash/object/pick');

module.exports = emitter;

function emitter() {
	var source = new EmitterSource();
	var stream = new Stream(source);
	return assign(stream, pick(source, 'emit', 'error', 'end'));
}

function EmitterSource() {
	this.producers = [ ];
	bindAll(this, 'emit', 'error', 'end');
}

EmitterSource.prototype.emit = function(x) {
	for (var i = 0; i < this.producers.length; ++i) {
		this.producers[i].emit(x);
	}
};

EmitterSource.prototype.error = function(e) {
	for (var i = 0; i < this.producers.length; ++i) {
		this.producers[i].error(e);
	}
};

EmitterSource.prototype.end = function() {
	for (var i = 0; i < this.producers.length; ++i) {
		this.producers[i].end();
	}
};

EmitterSource.prototype.run = function(sink, scheduler) {
	return new EmitterProducer(this.producers, sink, scheduler);
};

function EmitterProducer(producers, sink, scheduler) {
	this.sink = sink;
	this.scheduler = scheduler;
	this.active = true;
	this.producers = producers;
	producers.push(this);
}

EmitterProducer.prototype.emit = function(x) {
	if(!this.active) {
		return;
	}

	this.sink.event(this.scheduler.now(), x);

};

EmitterProducer.prototype.error = function(e) {
	if(!this.active) {
		return;
	}

	this.sink.error(this.scheduler.now(), e);
};

EmitterProducer.prototype.end = function() {
	if(!this.active) {
		return;
	}

	this.sink.end(this.scheduler.now(), void 0);
};

EmitterProducer.prototype.dispose = function() {
	this.active = false;
	pull(this.producers, this);
};
