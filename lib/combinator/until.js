
import between from './between';
import streamOf from '../source/of';

export default function takeUntil(signal, stream) {
	return between(streamOf(), signal, stream);
}
