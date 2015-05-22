/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import Stream from '../Stream';
import fatal from '../fatalError';
import Promise from '../Promise';

class Await {
	constructor(source) {
		this.source = source;
	}

	run(sink, scheduler) {
		return this.source.run(new AwaitSink(sink, scheduler), scheduler);
	}
}

class AwaitSink {
	constructor(sink, scheduler) {
		this.sink = sink;
		this.scheduler = scheduler;
		this.queue = void 0;
	}

	event(t, promise) {
		this.queue = resolve(this.queue)
			.then(() => this._event(t, promise))
			.catch((e) => this._error(t, e));
	}

	error(t, e) {
		this.queue = Promise.resolve(this.queue)
			.then(() => this._error(t, e))
			.catch(fatal);
	}

	end(t, x) {
		this.queue = Promise.resolve(this.queue)
			.then(() => this._end(t, x))
			.catch((e) => this._error(t, e));
	}

	_error(t, e) {
		try {
			// Don't resolve error values, propagate directly
			this.sink.error(Math.max(t, this.scheduler.now()), e);
		} catch(err) {
			fatal(err);
			throw err;
		}
	}

	_event(t, promise) {
		return promise.then((x) => {
			this.sink.event(Math.max(t, this.scheduler.now()), x);
			return x;
		});
	}

	_end(t, x) {
		return Promise.resolve(x).then((x) => {
			this.sink.end(Math.max(t, self.scheduler.now()), x);
			return x;
		});
	}
}

export default function await(stream) {
	return new Stream(new Await(stream.source));
}
