/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import Stream from '../Stream';
import MulticastSource from '../source/MulticastSource';
import until from './until';
import mergeConcurrently from './mergeConcurrently';
import map from './map';

/**
 * Given a stream of streams, return a new stream that adopts the behavior
 * of the most recent inner stream.
 * @param {Stream} stream of streams on which to switch
 * @returns {Stream} switching stream
 */
function switchLatest(stream) {
	const upstream = new Stream(new MulticastSource(stream.source));
	return mergeConcurrently(1, map((s) => until(upstream, s), upstream));
}
