/*global define */

define([
	'underscore',
	'knockout',
	'ko.ninja.model',
    'ko.ninja.extend',
    'ko.ninja.localStorageModel',
    'ko.ninja.validator',
    'esperanto',
    'ko.ninja.utils'
], function(_, ko, NinjaModel, extend, utils) {

	'use strict';

	/**
	 * @class NinjaCollection
	 */
	var NinjaCollection = function() {
		this._initialize.apply(this, _.toArray(arguments));
	};

	_.extend(NinjaCollection.prototype, /** @lends NinjaCollection.prototype */ {

		'_initialize': function() {

			/**
			 * Observable array responsible for tracking the models that belong to this collection.
			 */
			this.models = ko.observableArray();

		},

		/**
		 * Pushes a model instance (or an array of model instances) onto the collection's observable array.
		 */
		'push': function(models) {
			if ( !_.isArray(models) ) {
				models = [models];
			}
			var current_models = this.models();
			_.each(models, function(model) {
				if ( !(model instanceof NinjaModel) ) {
					throw 'Invalid model specified.';
				}
				if ( current_models.indexOf(model) < 0 ) {
					current_models.push(model);
				}
			});
			this.models(current_models);
		},

		/**
		 * Destroys the model and removes it from the collection.
		 */
		'destroy': function(model) {
			var d = utils.deferred();
			var id;
			if ( _.isObject(model) && model instanceof NinjaModel ) {
				id = model.id();
			} else if ( _.isNumber(model) || _.isString(model) ) {
				id = model;
				model = null;
			} else {
				d.reject('Invalid model specified.');
				return;
			}
			if ( !model ) {
				model = NinjaModel.cache.getInstance(this.model, id);
			}
			if ( !model ) {
				d.resolve(this);
				return;
			}
			var current_models = this.models();
			model.destroy().done(function() {
				var idx = current_models.indexOf(model);
				if ( idx >= 0 ) {
					current_models.splice(idx, 1);
					this.models(current_models);
				}
				d.resolve(this);
			}).fail(function() {
				d.reject('Unable to destroy model.');
			});
			return d.promise();
		},

		/**
		 * Removes the model from the collection.
		 */
		'remove': function(model) {
			var id;
			if ( _.isObject(model) && model instanceof NinjaModel ) {
				id = model.id();
			} else if ( _.isNumber(model) || _.isString(model) ) {
				id = model;
			} else {
				throw 'Invalid model specified.';
			}
			var models = this.models();
			var idx = models.indexOf(model);
			if ( idx >= 0 ) {
				models.splice(idx, 1);
				this.models(models);
			}
		}

	});

	NinjaCollection.extend = extend;

	return NinjaCollection;

});
