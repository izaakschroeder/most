/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/*global __PROMISE__:1*/
if (typeof __PROMISE__ !== 'undefined') {
	module.exports = require(__PROMISE__);
} else {
	module.exports = require('bluebird');
}
