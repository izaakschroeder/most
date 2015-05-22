
import map from './map';

/**
 * Replace each value in the stream with x
 * @param {*} x
 * @param {Stream} stream
 * @returns {Stream} stream containing items replaced with x
 */
export default function constant(x, stream) {
	return map(() => x, stream);
}
