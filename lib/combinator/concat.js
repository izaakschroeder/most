/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import fromArray from '../source/fromArray';
import concatMap from './concatMap';
import identity from 'lodash/utility/identity';

/**
 * @param {Stream} left
 * @param {Stream} right
 * @returns {Stream} new stream containing all events in left followed by all
 *  events in right.  This *timeshifts* right to the end of left.
 */
function concat(left, right) {
	return concatMap(identity, fromArray([left, right]));
}

module.exports = concat;
