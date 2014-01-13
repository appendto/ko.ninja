/*global define */

(function(root, factory) {
	'use strict';

	// AMD
	if (typeof define === 'function' && define.amd) {
		define([
			'underscore',
			'knockout',
			'ko.ninja.viewModel',
			'ko.ninja.model',
			'ko.ninja.collection'
		], factory);

		// Non-AMD
	} else {
		factory(root._, root.ko, root.ko.ninjaViewModel, root.ko.ninjaModel);
	}

}(this, function(_, ko, ViewModel, Model, Collection) {

	'use strict';

	ko.Collection = Collection;
	ko.ViewModel = ViewModel;
	ko.Model = Model;

	return ko;

}));
