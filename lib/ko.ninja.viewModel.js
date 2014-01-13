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
		this._initialize(_.toArray(arguments));
		this.initialize();
	};

	_.extend(NinjaViewModel.prototype, /** @lends NinjaViewModel.prototype */ {

		/**
		 * @override
		 */
		'observables': {},

		/*
		Private method for performing initial instance setup.
		*/
		'_initialize': function() {
			this.initObservables();
		},

		/**
		 * @override
		 */
		'initialize': function(options) {
		},

		'initObservables': utils.initObservables

	});

	NinjaViewModel.extend = extend;

	return NinjaViewModel;

});
