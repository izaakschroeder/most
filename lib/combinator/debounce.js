/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import Stream from '../Stream';
import CompoundDisposable from '../disposable/CompoundDisposable';
import PropagateTask from '../scheduler/PropagateTask';

class DebounceSink{
	constructor(dt, source, sink, scheduler) {
		this.dt = dt;
		this.sink = sink;
		this.scheduler = scheduler;
		this.value = void 0;
		this.timer = null;
		this.disposable = new CompoundDisposable([
			this,
			source.run(this, scheduler)
		]);
	}

	event(t, x) {
		this._clearTimer();
		this.value = x;
		this.timer = this.scheduler.delay(this.dt, PropagateTask.event(x, this.sink));
	}

	end(t, x) {
		if (this._clearTimer()) {
			this.sink.event(t, this.value);
			this.value = void 0;
		}
		this.sink.end(t, x);
	}

	error(t, x) {
		this._clearTimer();
		this.sink.error(t, x);
	}

	dispose() {
		this._clearTimer();
	}

	_clearTimer() {
		if (this.timer === null) {
			return false;
		}
		this.timer.cancel();
		this.timer = null;
		return true;
	}

}

class Debounce {
	constructor(dt, source) {
		this.dt = dt;
		this.source = source;
	}

	run(sink, scheduler) {
		return new DebounceSink(this.dt, this.source, sink, scheduler);
	}
}

/**
 * Wait for a burst of events to subside and emit only the last event in the burst
 * @param {Number} period events occuring more frequently than this
 *  will be suppressed
 * @param {Stream} stream stream to debounce
 * @returns {Stream} new debounced stream
 */
export default function debounce(period, stream) {
	return new Stream(new Debounce(period, stream.source));
}
