/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import streamOf from '../source/of';
import concat from './concat';

/**
 * @param {*} x value to prepend
 * @param {Stream} stream
 * @returns {Stream} new stream with x prepended
 */
export default function cons(x, stream) {
	return concat(streamOf(x), stream);
}
