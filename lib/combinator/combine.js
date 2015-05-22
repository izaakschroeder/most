/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import Stream from '../Stream';
import map from './map';
import empty from '../source/empty';
import Pipe from '../sink/Pipe';
import IndexSink from '../sink/IndexSink';
import CompoundDisposable from '../disposable/CompoundDisposable';
import pluck from 'lodash/collection/pluck';

class CombineSink {

	constructor(f, sinks, sink) {
		this.f = f;
		this.sinks = sinks;
		this.sink = sink;
		this.ready = false;
		this.activeCount = sinks.length;
	}

	event(t /*, indexSink */) {
		if (!this.ready) {
			this.ready = this.sinks.every('hasValue');
		}

		if (this.ready) {
			// TODO: Maybe cache values in their own array once this.ready
			this.sink.event(t, this.f(...pluck(this.sinks, 'value')));
		}
	}

	end(t, indexedValue) {
		if (--this.activeCount === 0) {
			this.sink.end(t, indexedValue.value);
		}
	}
}

CombineSink.prototype.error = Pipe.prototype.error;

class Combine {
	constructor (f, sources) {
		this.f = f;
		this.sources = sources;
	}

	run(sink, scheduler) {
		const l = this.sources.length;
		const disposables = new Array(l);
		const sinks = new Array(l);

		const combineSink = new CombineSink(this.f, sinks, sink);

		for(var indexSink, i=0; i<l; ++i) {
			indexSink = sinks[i] = new IndexSink(i, combineSink);
			disposables[i] = this.sources[i].run(indexSink, scheduler);
		}

		return new CompoundDisposable(disposables);
	}
}

/**
 * Combine latest events from all input streams
 * @param {function(...events):*} f function to combine most recent events
 * @returns {Stream} stream containing the result of applying f to the most recent
 *  event of each input stream, whenever a new event arrives on any stream.
 */
export default function combine(f, ...streams) {
	if (streams.length === 0) {
		return empty();
	} else if (streams.length === 1) {
		return map(f, streams[0]);
	} else {
		return new Stream(new Combine(f, pluck(streams, 'source')));
	}
}
