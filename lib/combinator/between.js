
import Stream from '../Stream';
import Pipe from '../sink/Pipe';
import CompoundDisposable from '../disposable/CompoundDisposable';
import take from './take';
import noop from 'lodash/utility/noop';


class WithinSink {
	constructor(min, max, sink) {
		this.min = min;
		this.max = max;
		this.sink = sink;
	}

	event(t, x) {
		if (t >= this.min.value && t < this.max.value) {
			this.sink.event(t, x);
		}
	}
}

WithinSink.prototype.error = Pipe.prototype.error;
WithinSink.prototype.end = Pipe.prototype.end;


class MinBound {
	constructor(signal, sink, scheduler) {
		this.value = Infinity;
		this.sink = sink;
		this.disposable = signal.run(this, scheduler);
	}

	event(t /*, x */) {
		if (t < this.value) {
			this.value = t;
		}
	}

	dispose() {
		return this.disposable.dispose();
	}
}

MinBound.prototype.end = noop;
MinBound.prototype.error = Pipe.prototype.error;

class MaxBound {
	constructor(signal, sink, scheduler) {
		this.value = Infinity;
		this.sink = sink;
		this.disposable = signal.run(this, scheduler);
	}

	event(t, x) {
		if (t < this.value) {
			this.value = t;
			this.sink.end(t, x);
		}
	}

	dispose() {
		return this.disposable.dispose();
	}
}

MaxBound.prototype.end = noop;
MaxBound.prototype.error = Pipe.prototype.error;


class Within {
	constructor(minSignal, maxSignal, source) {
		this.minSignal = minSignal;
		this.maxSignal = maxSignal;
		this.source = source;
	}

	run(sink, scheduler) {
		const min = new MinBound(this.minSignal, sink, scheduler);
		const max = new MaxBound(this.maxSignal, sink, scheduler);
		const disposable = this.source.run(new WithinSink(min, max, sink), scheduler);

		return new CompoundDisposable([min, max, disposable]);
	}
}


export default function between(start, end, stream) {
	return new Stream(new Within(take(1, start).source, take(1, end).source, stream.source));
}
