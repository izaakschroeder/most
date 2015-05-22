
import slice from './slice';
import between from './between';

class SkipWhileSink {
	constructor(p, sink) {
		this.p = p;
		this.sink = sink;
		this.skipping = true;
	}

	event(t, x) {
		if (this.skipping && (this.skipping = this.p(x))) {
			return;
		}

		this.sink.event(t, x);
	}
}

SkipWhileSink.prototype.end   = Sink.prototype.end;
SkipWhileSink.prototype.error = Sink.prototype.error;

class SkipWhile {
	constructor(p, source) {
		this.p = p;
		this.source = source;
	}

	run(sink, scheduler) {
		return this.source.run(new SkipWhileSink(this.p, sink), scheduler);
	}
}

/**
 * @param {number} n
 * @param {Stream} stream
 * @returns {Stream} new stream with the first n items removed
 */
export default function skip(p, stream) {
	if (isFunction(p)) {
		return new Stream(new SkipWhile(p, stream.source));
	} else {
		return slice(n, Infinity, stream);
	}
}
