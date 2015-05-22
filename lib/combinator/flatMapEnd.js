/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import Stream from '../Stream';
import Sink from '../sink/Pipe';
import AwaitingDisposable from '../disposable/AwaitingDisposable';
import CompoundDisposable from '../disposable/CompoundDisposable';


class FlatMapEndSink {
	constructor(f, source, sink, scheduler) {
		this.f = f;
		this.sink = sink;
		this.scheduler = scheduler;
		this.active = true;
		this.disposable = new AwaitingDisposable(source.run(this, scheduler));
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

		this.dispose();

		this.disposable = new CompoundDisposable([
			this.disposable,
			this.f(x).source.run(this.sink, this.scheduler)
		]);
	}

	dispose() {
		this.active = false;
		return this.disposable.dispose();
	}
}

FlatMapEndSink.prototype.error = Sink.prototype.error;

class FlatMapEnd {
	constructor(f, source) {
		this.f = f;
		this.source = source;
	}

	run(sink, scheduler) {
		return new FlatMapEndSink(this.f, this.source, sink, scheduler);
	}
}

export default function flatMapEnd(f, stream) {
	return new Stream(new FlatMapEnd(f, stream.source));
}
