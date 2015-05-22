
import between from './between';
import join from './join';

export default function during(timeWindow, stream) {
	return between(timeWindow, join(timeWindow), stream);
}
