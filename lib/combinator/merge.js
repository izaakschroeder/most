/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import empty from '../source/empty';
import fromArray from '../source/fromArray';
import mergeConcurrently from './mergeConcurrently';

/**
 * @param {Array} streams array of stream to merge
 * @returns {Stream} stream containing events from all input observables
 * in time order.  If two events are simultaneous they will be merged in
 * arbitrary order.
 */
function mergeArray(streams) {
	switch (streams.length) {
	case 0:
		return empty();
	case 1:
		return streams[0];
	default:
		return mergeConcurrently(l, fromArray(streams))
	}
}

/**
 * @returns {Stream} stream containing events from all streams in the argument
 * list in time order.  If two events are simultaneous they will be merged in
 * arbitrary order.
 */
export default function merge(...streams) {
	return mergeArray(streams);
}
