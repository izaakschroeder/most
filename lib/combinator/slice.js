/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import Stream from '../Stream';
import Sink from '../sink/Pipe';
import empty from '../source/empty';
import AwaitingDisposable from '../disposable/AwaitingDisposable';

class SliceSink {
	constructor(skip, take, source, sink, scheduler) {
		this.skip = skip;
		this.take = take;
		this.sink = sink;
		this.disposable = new AwaitingDisposable(source.run(this, scheduler));
	}

	event(t, x) {
		if (this.skip > 0) {
			this.skip -= 1;
			return;
		}

		if (this.take === 0) {
			return;
		}

		this.take -= 1;
		this.sink.event(t, x);
		if (this.take === 0) {
			this.dispose();
			this.sink.end(t, x);
		}
	}

	dispose() {
		return this.disposable.dispose();
	}
}

SliceSink.prototype.end   = Sink.prototype.end;
SliceSink.prototype.error = Sink.prototype.error;

class Slice {
	constructor(min, max, source) {
		this.skip = min;
		this.take = max - min;
		this.source = source;
	}

	run(sink, scheduler) {
		return new SliceSink(this.skip, this.take, this.source, sink, scheduler);
	}
}

/**
 * Slice a stream by index. Negative start/end indexes are not supported
 * @param {number} start
 * @param {number} end
 * @param {Stream} stream
 * @returns {Stream} stream containing items where start <= index < end
 */
export default function slice(start, end, stream) {
	return end <= start ? empty()
		: new Stream(new Slice(start, end, stream.source));
}
