/*global define */

define([
	'underscore',
	'knockout',
	'ko.ninja.extend',
	'ko.ninja.localStorageModel',
	'ko.ninja.validator',
	'esperanto',
	'ko.ninja.utils'
], function(_, ko, extend, LocalStorageModel, validator, Esperanto, utils) {

	'use strict';

	/**
	 * @class NinjaViewModel
	 */
	var NinjaViewModel = function() {
		var options = _.first(_.toArray(arguments));
		this._initialize(options);
		this.initialize(options);
	};

	_.extend(NinjaViewModel.prototype, /** @lends NinjaViewModel.prototype */ {

		/**
		 * @override
		 */
		'observables': {},

		/*
		Private method for performing initial instance setup.
		*/
		'_initialize': function(options) {
			var self = this;
			this.initObservables();
			_.each(options, function(value, key) {
				if (ko.isObservable(self[key])) {
					self[key](value);
				}
			});
		},

		/**
		 * @override
		 */
		'initialize': function() {},

		'initObservables': utils.initObservables

	});

	NinjaViewModel.extend = extend;

	return NinjaViewModel;

});
