/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import Stream from '../Stream';
import Sink from '../sink/Pipe';
import CompoundDisposable from '../disposable/CompoundDisposable';
import PropagateTask from '../scheduler/PropagateTask';




class Delay {
	constructor(dt, source) {
		this.dt = dt;
		this.source = source;
	}

	run(sink, scheduler) {
		var delaySink = new DelaySink(this.dt, sink, scheduler);
		return new CompoundDisposable([delaySink, this.source.run(delaySink, scheduler)]);
	}
}

class DelaySink {
	constructor(dt, sink, scheduler) {
		this.dt = dt;
		this.sink = sink;
		this.scheduler = scheduler;
	}

	dispose() {
		var self = this;
		this.scheduler.cancelAll(function(task) {
			return task.sink === self.sink;
		});
	}

	event(t, x) {
		this.scheduler.delay(this.dt, PropagateTask.event(x, this.sink));
	}

	end(t, x) {
		this.scheduler.delay(this.dt, PropagateTask.end(x, this.sink));
	}
}

DelaySink.prototype.error = Sink.prototype.error;

/**
 * @param {Number} delayTime milliseconds to delay each item
 * @param {Stream} stream
 * @returns {Stream} new stream containing the same items, but delayed by ms
 */
export default function delay(delayTime, stream) {
	return delayTime <= 0 ? stream
		 : new Stream(new Delay(delayTime, stream.source));
}
