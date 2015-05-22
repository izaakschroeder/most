require('buster').spec.expose();
var expect = require('buster').expect;

var MulticastSource = require('../../lib/source/MulticastSource');
var streamOf = require('../../lib/source/core').of;
var repeat = require('../../lib/source/iterate').repeat;
var take = require('../../lib/combinator/slice').take;
var reduce = require('../../lib/combinator/accumulate').reduce;
var drain = require('../../lib/combinator/observe').drain;
var Stream = require('../../lib/Stream');
var scheduler = require('../../lib/scheduler/defaultScheduler');
var Promise = require('../../lib/Promise');

var FakeDisposeSource = require('../helper/FakeDisposeSource');

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('MulticastSource', function() {

	it('should call producer on first subscriber', function() {
		var eventSpy = this.spy();
		var s = new MulticastSource({ run: function() {} });

		s.run({ event: eventSpy }, scheduler);
		s.sink.event(sentinel);

		expect(eventSpy).toHaveBeenCalledOnceWith(sentinel);
	});

	it('should call producer ONLY on first subscriber', function() {
		var sourceSpy = this.spy();
		var s = new MulticastSource({ run: sourceSpy });

		return Promise.all([
			s.run({ event: function() {} }, scheduler),
			s.run({ event: function() {} }, scheduler),
			s.run({ event: function() {} }, scheduler),
			s.run({ event: function() {} }, scheduler)
		]).then(function() {
			expect(sourceSpy).toHaveBeenCalledOnce();
		});
	});

	it('should publish events to all subscribers', function() {
		var s = new MulticastSource(streamOf(sentinel).source);

		function second(_, y) {
			return y;
		}

		return Promise.all([reduce(second, other, s), reduce(second, other, s)])
			.then(function(values) {
				expect(values[0]).toBe(sentinel);
				expect(values[1]).toBe(sentinel);
			});
	});

	it('should call dispose if all subscribers disconnect', function() {
		var spy = this.spy();
		var s = new Stream(new MulticastSource(FakeDisposeSource.from(spy, streamOf(sentinel))));

		return Promise.all([drain(s), drain(s)]).then(function() {
			expect(spy).toHaveBeenCalledOnce();
		});
	});
});