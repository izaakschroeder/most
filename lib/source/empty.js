
import Stream from '../Stream';
import Disposable from '../disposable/Disposable';

function EmptySource() {}

EmptySource.prototype.run = function(sink, scheduler) {
	const task = PropagateTask.end(void 0, sink);
	scheduler.asap(task);
	return new Disposable((t) => t.dispose(), task);
};

const EMPTY = new Stream(new EmptySource());

/**
 * Stream containing no events and ends immediately
 * @returns {Stream}
 */
export default function empty() {
	return EMPTY;
}
