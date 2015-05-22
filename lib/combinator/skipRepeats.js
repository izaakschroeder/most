
import Sink from '../sink/Pipe';
import Stream from '../Stream';

class SkipRepeatsSink {
	constructor(equals, sink) {
		this.equals = equals;
		this.sink = sink;
		this.value = void 0;
		this.init = true;
	}

	event(t, x) {
		if (this.init) {
			this.init = false;
			this.value = x;
			this.sink.event(t, x);
		} else if (!this.equals(this.value, x)) {
			this.value = x;
			this.sink.event(t, x);
		}
	}
}
SkipRepeatsSink.prototype.end   = Sink.prototype.end;
SkipRepeatsSink.prototype.error = Sink.prototype.error;

class SkipRepeats {
	constructor(equals, source) {
		this.equals = equals;
		this.source = source;
	}

	run(sink, scheduler) {
		return this.source.run(new SkipRepeatsSink(this.equals, sink), scheduler);
	}
}

/**
 * Skip repeated events using the provided equals function to detect duplicates
 * @param {function(a:*, b:*):boolean} equals optional function to compare items
 * @param {Stream} stream stream from which to omit repeated events
 * @returns {Stream} stream without repeated events
 */
export default function skipRepeats(equals, stream) {

	return new Stream(new SkipRepeats(equals || same, stream.source));
}
