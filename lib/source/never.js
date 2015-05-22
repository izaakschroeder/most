
import Stream from '../Stream';
import EmptyDisposable from '../disposable/EmptyDisposable';

function NeverSource() {}

NeverSource.prototype.run = function() {
	return new EmptyDisposable();
};

const NEVER = new Stream(new NeverSource());

/**
 * Stream containing no events and never ends
 * @returns {Stream}
 */
export default function never() {
	return NEVER;
}
