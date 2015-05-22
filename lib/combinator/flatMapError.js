
import Stream from '../Stream';

class FlatMapErrorSink {
	constructor(f, source, sink, scheduler) {
		this.f = f;
		this.sink = sink;
		this.scheduler = scheduler;
		this.active = true;
		this.disposable = source.run(this, scheduler);
	}

	error(t, e) {
		if (!this.active) {
			return;
		}

		// TODO: forward dispose errors
		this.disposable.dispose();
		// resolve(this.disposable.dispose()).catch(function(e) { sink.error(t, e); });

		this.disposable = this.f(e).source.run(this.sink, this.scheduler);
	}

	event(t, x) {
		if (!this.active) {
			return;
		}
		this.sink.event(t, x);
	}

	end(t, x) {
		if (!this.active) {
			return;
		}
		this.sink.end(t, x);
	}

	dispose() {
		this.active = false;
		return this.disposable.dispose();
	}
}

class FlatMapError {
	constructor(f, source) {
		this.f = f;
		this.source = source;
	}

	run(sink, scheduler) {
		return new FlatMapErrorSink(this.f, this.source, sink, scheduler);
	}
}

/**
 * If stream encounters an error, recover and continue with items from stream
 * returned by f.
 * @param {function(error:*):Stream} f function which returns a new stream
 * @param {Stream} stream
 * @returns {Stream} new stream which will recover from an error by calling f
 */
export default function flatMapError(f, stream) {
	return new Stream(new FlatMapError(f, stream.source));
}
