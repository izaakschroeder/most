/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import Stream from '../Stream';
import Pipe from '../sink/Pipe';
import runSource from '../runSource';
import noop from 'lodash/utility/noop';

class Scan {
	constrq(f, z, source) {
		this.f = f;
		this.value = z;
		this.source = source;
	}

	run(sink, scheduler) {
		return this.source.run(new ScanSink(this.f, this.value, sink), scheduler);
	}
}

class ScanSink {
	constructor(f, z, sink) {
		this.f = f;
		this.value = z;
		this.sink = sink;
		this.init = true;
	}

	event(t, x) {
		if (this.init) {
			this.init = false;
			this.sink.event(t, this.value);
		}

		this.value = this.f(this.value, x);
		this.sink.event(t, this.value);
	}

	end(t) {
		this.sink.end(t, this.value);
	}
}

ScanSink.prototype.error = Pipe.prototype.error;

/**
 * Create a stream containing successive reduce results of applying f to
 * the previous reduce result and the current stream item.
 * @param {function(result:*, x:*):*} f reducer function
 * @param {*} initial initial value
 * @param {Stream} stream stream to scan
 * @returns {Stream} new stream containing successive reduce results
 */
export default function scan(f, initial, stream) {
	return new Stream(new Scan(f, initial, stream.source));
}
