
import Stream from '../Stream';
import ValueSource from '../source/ValueSource';

function emit(t, x, sink) {
	sink.event(0, x);
	sink.end(0, void 0);
}

/**
 * Stream containing only x
 * @param {*} x
 * @returns {Stream}
 */
export default function streamOf(x) {
	return new Stream(new ValueSource(emit, x));
}
