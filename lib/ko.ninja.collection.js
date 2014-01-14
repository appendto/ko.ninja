/*global define */

define([
	'underscore',
	'knockout',
	'ko.ninja.model',
	'ko.ninja.extend',
	'ko.ninja.validator',
	'ko.ninja.utils',
	'ko.ninja.storage'
], function(_, ko, NinjaModel, extend, validator, utils, storage) {

	'use strict';

	/**
	 * @class NinjaCollection
	 */
	var NinjaCollection = function() {
		this._initialize.apply(this, _.toArray(arguments));
	};

	_.extend(NinjaCollection.prototype, /** @lends NinjaCollection.prototype */ {

		'parent': null,

		'_initialize': function(data, parent) {

			var self = this;

			self.parent = parent;

			/**
			 * Observable array responsible for tracking the models that belong to this collection.
			 */
			this.models = ko.observableArray();

			this.length = ko.computed(function() {
				return self.models().length;
			});

		},

		'fetch': function() {
			var self = this;
			var d = utils.deferred();
			console.log('x', this.makeUrl());
			storage.get(this.makeUrl()).done(function(result) {
				console.log('r', result);
				self.set(result);
				d.resolve(this);
			}).fail(function() {
				d.reject(this);
			});
			return d.promise();
		},

		'create': function(data) {
			var self = this;
			var d = utils.deferred();
			if ( !_.isArray(data) ) {
				data = [data];
			}
			_.each(data, function(row) {
				var model = new self.model(row, self);
				model.save().done(function(model) {
					self.set(model);
					d.resolve(model);
				}).fail(function() {
					d.reject();
				});
			});
			return d.promise();
		},

		/**
		 * Pushes a model instance (or an array of model instances) onto the collection's observable array.
		 */
		'push': function(models) {
			var self = this;
			if (!_.isArray(models)) {
				models = [models];
			}
			var current_models = this.models();
			_.each(models, function(model) {
				if (!(model instanceof NinjaModel)) {
					var instance = new self.model(model);
					if ( !self.contains(model) ) {
						current_models.push(model);
					}
				} else {
					if ( !self.contains(model) ) {
						current_models.push(model);
					}
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
			if (_.isObject(model) && model instanceof NinjaModel) {
				id = model.id();
			} else if (_.isNumber(model) || _.isString(model)) {
				id = model;
				model = null;
			} else {
				d.reject('Invalid model specified.');
				return;
			}
			if (!model) {
				model = NinjaModel.cache.getInstance(this.model, id);
			}
			if (!model) {
				d.resolve(this);
				return;
			}
			var current_models = this.models();
			model.destroy().done(function() {
				var idx = current_models.indexOf(model);
				if (idx >= 0) {
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
			if (_.isObject(model) && model instanceof NinjaModel) {
			} else if (_.isNumber(model) || _.isString(model)) {
			} else {
				throw 'Invalid model specified.';
			}
			var models = this.models();
			var idx = models.indexOf(model);
			if (idx >= 0) {
				models.splice(idx, 1);
				this.models(models);
			}
		},

		'makeUrl': function() {
			var result;
			if ( this.parent ) {
				result = this.parent.makeUrl();
				result = result.replace('.json', '/' + this.model.prototype.model + '.json');
			} else {
				result = ko.baseApiUrl + this.url + '.json';
			}
			return result;
		},

		'set': function(data) {
			var self = this;
			if ( !_.isArray(data) ) {
				data = [data];
			}
			_.each(data, function(row) {
				if (!(row instanceof NinjaModel)) {
					var model = new self.model(row);
					self.push(model);
				} else {
					self.push(row);
				}
			});
		},

		'contains': function(model) {
			if ( this.models.indexOf(model) >= 0 ) {
				return true;
			} else {
				return false;
			}
		},

		'serialize': function() {
			var result = [];
			_.each(this.models(), function(model) {
				result.push(model.serialize());
			});
			return result;
		},

		'first': function() {
			var models = this.models();
			if ( _.isEmpty(models) ) {
				return undefined;
			}
			return _.first(models);
		},

		'last': function() {
			var models = this.models();
			if ( _.isEmpty(models) ) {
				return undefined;
			}
			return _.last(models);
		},

		'at': function(idx) {
			var models = this.models();
			return models[idx];
		},

		'clear': function() {
			this.models.removeAll();
		}

	});

	NinjaCollection.extend = extend;

	return NinjaCollection;

});
