/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var mergeConcurrently = require('./mergeConcurrently').mergeConcurrently;
var map = require('./transform').map;

exports.flatMap = flatMap;
exports.join = join;

/**
 * Map each value in the stream to a new stream, and merge it into the
 * returned outer stream. Event arrival times are preserved.
 * @param {function(x:*):Stream} f chaining function, must return a Stream
 * @param {Stream} stream
 * @returns {Stream} new stream containing all events from each stream returned by f
 */
function flatMap(f, stream) {
	return join(map(f, stream));
}

/**
 * Monadic join. Flatten a Stream<Stream<X>> to Stream<X> by merging inner
 * streams to the outer. Event arrival times are preserved.
 * @param {Stream<Stream<X>>} stream stream of streams
 * @returns {Stream<X>} new stream containing all events of all inner streams
 */
function join(stream) {
	return mergeConcurrently(Infinity, stream);
}
