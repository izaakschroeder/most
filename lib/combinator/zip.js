/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
import streamMap from './map';
var empty = require('../source/empty');
var Sink = require('../sink/Pipe');
var IndexSink = require('../sink/IndexSink');
var CompoundDisposable = require('../disposable/CompoundDisposable');
var Queue = require('../Queue');
var map = require('lodash/collection/map');
var pluck = require('lodash/collection/pluck');
var rest = require('lodash/array/rest');
var flatten = require('lodash/array/flatten');


/**
 * Combine streams pairwise (or tuple-wise) by index by applying f to values
 * at corresponding indices.  The returned stream ends when any of the input
 * streams ends.
 * @param {function} f function to combine values
 * @returns {Stream} new stream with items at corresponding indices combined
 *  using f
 */
export default function zip(f, ...streams) {
	return zipArray(f, streams);
}

/**
 * Combine streams pairwise (or tuple-wise) by index by applying f to values
 * at corresponding indices.  The returned stream ends when any of the input
 * streams ends.
 * @param {function} f function to combine values
 * @param {[Stream]} streams streams to zip using f
 * @returns {Stream} new stream with items at corresponding indices combined
 *  using f
 */
function zipArray(f, streams) {
	switch (streams.length) {
	case 0:
		return empty();
	case 1:
		return streamMap(f, streams[0]);
	default:
		return new Stream(new Zip(f, pluck(streams, 'source')));
	}
}

class Zip {
	constructor(f, sources) {
		this.f = f;
		this.sources = sources;
	}

	run(sink, scheduler) {
		var l = this.sources.length;
		var disposables = new Array(l);
		var sinks = new Array(l);
		var buffers = new Array(l);

		var zipSink = new ZipSink(this.f, buffers, sinks, sink);

		for(var indexSink, i=0; i<l; ++i) {
			buffers[i] = new Queue();
			indexSink = sinks[i] = new IndexSink(i, zipSink);
			disposables[i] = this.sources[i].run(indexSink, scheduler);
		}

		return new CompoundDisposable(disposables);
	}
}

class ZipSink {
	constructor(f, buffers, sinks, sink) {
		this.f = f;
		this.sinks = sinks;
		this.sink = sink;
		this.buffers = buffers;
	}

	event(t, indexedValue) {
		const buffers = this.buffers;
		const buffer = buffers[indexedValue.index];

		buffer.push(indexedValue.value);

		if (buffer.length() === 1) {
			if (!ready(this.buffers)) {
				return;
			}

			emitZipped(this.f, t, buffers, this.sink);

			if (ended(this.buffers, this.sinks)) {
				this.sink.end(t, void 0);
			}
		}
	};

	end(t, indexedValue) {
		const buffer = this.buffers[indexedValue.index];
		if (buffer.isEmpty()) {
			this.sink.end(t, indexedValue.value);
		}
	};
}

ZipSink.prototype.error = Sink.prototype.error;

function emitZipped (f, t, buffers, sink) {
	sink.event(t, f(...map(buffers, buffer => buffer.shift())));
}


function ended(buffers, sinks) {
	for (let i=0, l=buffers.length; i<l; ++i) {
		if (buffers[i].isEmpty() && !sinks[i].active) {
			return true;
		}
	}
	return false;
}

function ready(buffers) {
	for(var i=0, l=buffers.length; i<l; ++i) {
		if(buffers[i].isEmpty()) {
			return false;
		}
	}
	return true;
}
