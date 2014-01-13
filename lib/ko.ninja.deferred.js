/*global define */

define(function() {

	'use strict';

	var Deferred = function() {
		this.callbacks = [];
	};

	Deferred.prototype = {
		err: 0,
		x: 0,

		$: function(arr) {
			this.callbacks.push(arr);
			if (this.x === 2) {
				this._(this.o);
			}
			return this;
		},

		done: function(cb) {
			return this.$([cb, 0]);
		},

		fail: function(cb) {
			return this.$([0, cb]);
		},

		always: function(cb) {
			return this.$([0, 0, cb]);
		},

		promise: function(cb, err) {
			return this.$([cb, err]);
		},

		reject: function(obj) {
			if (!this.x) {
				this.err = 1;
				this._(obj);
			}
			return this;
		},

		resolve: function(obj) {
			if (!this.x) {
				this._(obj);
			}
			return this;
		},

		_: function(obj) {
			this.x = 1;
			for (var state = this.err, cb = this.callbacks, method = cb.shift(), value = obj; method;) {
				try {
					while (method) {
						(method = method[2] || (state ? method[1] : method[0])) && (value = method(value || obj)); // jshint ignore:line

						if (value instanceof Deferred) {
							/*jshint ignore:start */
							var that = this;
							value.always(function(v) {
								that._(v || obj);
								return v;
							});
							/*jshint ignore:end */
							return;
						}
						method = cb.shift();
					}
				} catch (e) {
					if (state) {
						method = cb.shift();
						this.err = state = 1;
					}
				}
			}
			this.o = value || obj;
			this.x = 2;
		}
	};

	Deferred.when = function(m, args) {
		if (!args) return m;

		args = [].slice.call(arguments);
		m = new Deferred();

		var i = args.length,
			n = i,
			res = [],
			done = function(j) {
				return function(v) {
					res[j] = v;
					if (!--n) {
						m.resolve(res);
					}
				};
			},
			fail = function(v) {
				m.reject(v);
			};

		while (i--) args[i].then(done(i), fail);
		return m;
	};

	return Deferred;
});
