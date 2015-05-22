import slice from './slice';

class TakeWhileSink {
	constructor(p, source, sink, scheduler) {
		this.p = p;
		this.sink = sink;
		this.active = true;
		this.disposable = new AwaitingDisposable(source.run(this, scheduler));
	}

	event(t, x) {
		if (!this.active) {
			return;
		} else if(this.active = this.p(x)) {
			this.sink.event(t, x);
		} else {
			this.dispose();
			this.sink.end(t, x);
		}
	}

	dispose() {
		return this.disposable.dispose();
	}
}

TakeWhileSink.prototype.end   = Sink.prototype.end;
TakeWhileSink.prototype.error = Sink.prototype.error;

class TakeWhile {
	constructor(p, source) {
		this.p = p;
		this.source = source;
	}

	run(sink, scheduler) {
		return new TakeWhileSink(this.p, this.source, sink, scheduler);
	}
}

/**
 * @param {number} n
 * @param {Stream} stream
 * @returns {Stream} new stream containing only up to the first n items from stream
 */
export default function take(p, stream) {
	if (isFunction(p)) {
		return new Stream(new TakeWhile(p, stream.source));
	} else if (isNumber(p)) {
		return slice(0, n, stream);
	} else {
		throw new TypeError();
	}
}
