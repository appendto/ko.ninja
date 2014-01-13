/*global define, $ */

define([
	'underscore',
	'knockout',
	'ko.ninja.deferred'
], function(_, ko, Deferred) {

	'use strict';

	return {

		/**
		 * Generates a RFC 4122 Universally Unique Identifier (UID)
		 * @link http://tools.ietf.org/search/rfc4122
		 * @return {String}
		 */
		'generateUID': function() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
				return v.toString(16);
			});
		},

		/**
		 * Assumes that the parent object has an object of values stored at the
		 * this.observables property, which are intended to be converted into Knockout
		 * observables. Loops through each one and does so.
		 * @mixin
		 */
		'initObservables': function() {
			var self = this;
			_.each(this.observables, function(obs, obsKey) {
				if ( _.isFunction(obs) ) {
					self[obsKey] = ko.computed({
						'read': obs,
						'deferEvaluation': true,
						'owner': self
					});
				} else if ( _.isArray(obs) ) {
					self[obsKey] = ko.observableArray(obs);
				} else if ( _.isObject(obs) && obs.read ) {
					obs.owner = self;
					self[obsKey] = ko.computed(obs);
				} else {
					self[obsKey] = ko.observable(obs);
				}
			});
		},

		'deferred': function (options) {
			if (typeof window.$ === 'object') {
				return $.Deferred(options);
			} else {
				return new Deferred(options);
			}
		}

	};

});
