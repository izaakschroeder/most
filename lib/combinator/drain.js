/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import runSource from '../runSource';
import noop from 'lodash/utility/noop';

/**
 * "Run" a stream by
 * @param stream
 * @return {*}
 */
export default function drain(stream) {
	return runSource(noop, stream.source);
}
