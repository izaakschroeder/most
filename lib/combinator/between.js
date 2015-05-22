
import Stream from '../Stream';
import Pipe from '../sink/Pipe';
import CompoundDisposable from '../disposable/CompoundDisposable';
import take from './take';
import noop from 'lodash/utility/noop';

export default function between(start, end, stream) {
	return new Stream(new Within(take(1, start).source, take(1, end).source, stream.source));
}

function Within(minSignal, maxSignal, source) {
	this.minSignal = minSignal;
	this.maxSignal = maxSignal;
	this.source = source;
}

Within.prototype.run = function(sink, scheduler) {
	const min = new MinBound(this.minSignal, sink, scheduler);
	const max = new MaxBound(this.maxSignal, sink, scheduler);
	const disposable = this.source.run(new WithinSink(min, max, sink), scheduler);

	return new CompoundDisposable([min, max, disposable]);
};

function WithinSink(min, max, sink) {
	this.min = min;
	this.max = max;
	this.sink = sink;
}

WithinSink.prototype.event = function(t, x) {
	if (t >= this.min.value && t < this.max.value) {
		this.sink.event(t, x);
	}
};

WithinSink.prototype.error = Pipe.prototype.error;
WithinSink.prototype.end = Pipe.prototype.end;

function MinBound(signal, sink, scheduler) {
	this.value = Infinity;
	this.sink = sink;
	this.disposable = signal.run(this, scheduler);
}

MinBound.prototype.event = function(t /*, x */) {
	if (t < this.value) {
		this.value = t;
	}
};

MinBound.prototype.end = noop;
MinBound.prototype.error = Pipe.prototype.error;

MinBound.prototype.dispose = function() {
	return this.disposable.dispose();
};

function MaxBound(signal, sink, scheduler) {
	this.value = Infinity;
	this.sink = sink;
	this.disposable = signal.run(this, scheduler);
}

MaxBound.prototype.event = function(t, x) {
	if (t < this.value) {
		this.value = t;
		this.sink.end(t, x);
	}
};

MaxBound.prototype.end = noop;
MaxBound.prototype.error = Pipe.prototype.error;

MaxBound.prototype.dispose = function() {
	return this.disposable.dispose();
};
