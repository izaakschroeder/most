/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import Stream from '../Stream';
import Sink from '../sink/Pipe';
import Promise from '../Promise';

class CycleSink {
	constructor(source, sink, scheduler) {
		this.active = true;
		this.sink = sink;
		this.scheduler = scheduler;
		this.source = source;
		this.disposable = source.run(this, scheduler);
	}

	event(t, x) {
		if (!this.active) {
			return;
		}
		this.sink.event(t, x);
	}

	end(t) {
		if (!this.active) {
			return;
		}

		Promise
			.resolve(this.disposable.dispose())
			.catch((e) => self.error(t, e));
		this.disposable = this.source.run(this, this.scheduler);
	}

	dispose() {
		this.active = false;
		return this.disposable.dispose();
	}


}

CycleSink.prototype.error = Sink.prototype.error;

class Cycle {
	constructor(source) {
		this.source = source;
	}

	run(sink, scheduler) {
		return new CycleSink(this.source, sink, scheduler);
	}
}

/**
 * Tie stream into a circle, thus creating an infinite stream
 * @param {Stream} stream
 * @returns {Stream} new infinite stream
 */
export default function cycle(stream) {
	return new Stream(new Cycle(stream.source));
}
