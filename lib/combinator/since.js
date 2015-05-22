
import between from './between';

export default function since(signal, stream) {
	return between(signal, never(), stream);
}
