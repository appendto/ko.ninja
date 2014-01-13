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
	 * Ensures we never instantiate two separate instances of the same model.
	 */
	var cache = {

		'models': {},

		/**
		 * Searches the cache for an instance of the specified model type with the given id.
		 * Returns the instance, or null if nothing is found.
		 */
		'getInstance': function(model, id) {
			if (!this.models[model]) {
				return null;
			}
			if (this.models[model][id]) {
				return this.models[model][id];
			}
			return null;
		},

		/**
		 * Stores a model instance in the cache.
		 */
		'setInstance': function(model) {
			if (!(model instanceof NinjaModel)) {
				throw 'Invalid model specified.';
			}
			if (!model.id()) {
				throw 'Model does not have a value set for id.';
			}
			if (!this.models[model.model]) {
				this.models[model.model] = {};
			}
			this.models[model.model][model.id()] = model;
		},

		/**
		 * Removes a model instance from the cache.
		 */
		'removeInstance': function(model, id) {
			if (!this.models[model]) {
				return null;
			}
			if (this.models[model][id]) {
				delete this.models[model][id];
			}
		},

		/**
		 * Returns the entire cache.models object.
		 */
		'getAll': function() {
			return this.models;
		}

	};

	/**
	 * This is the core class upon which all other NinjaModel instances are based.
	 *
	 * @class NinjaModel
	 */
	var NinjaModel = function() {

		if (!NinjaModel.esperanto_initialized) {
			NinjaModel.initializeEsperanto();
		}

		var options = _.toArray(arguments);
		var attributes = _.first(options);

		if (_.isObject(attributes) && !_.isArray(attributes)) {} else if (_.isString(attributes) || _.isNumber(attributes)) {
			var attrs = {};
			attrs[this.idAttribute] = attributes;
			attributes = attrs;
		} else if (!attributes) {
			attributes = {};
		} else {
			throw 'Invalid model attributes specified.';
		}

		var defaults = {};
		defaults[this.idAttribute] = null;
		_.defaults(attributes, defaults);

		var cached = cache.getInstance(this.model, attributes[this.idAttribute]);
		if (cached) {
			return cached;
		}

		options.splice(0, 1, attributes);

		this._initialize.apply(this, options);
		if (_.isFunction(this.initialize)) {
			this.initialize.apply(this);
		}

	};

	NinjaModel.storage = {
		'method': 'localStorage'
	};

	NinjaModel.esperanto_initialized = false;

	/**
	 * Initializes the default data store for all models.
	 */
	NinjaModel.initializeEsperanto = function() {
		switch (NinjaModel.storage.method) {
			case 'localStorage':
				NinjaModel.esperanto = new Esperanto('localStorage');
				break;
		}
	};

	_.extend(NinjaModel.prototype, /** @lends NinjaModel.prototype */ {

		/**
		 * The key that references the unique identifier for this model.
		 */
		'idAttribute': 'id',

		/*
		Internal method that initializes the instance before calling the user-defined
		`initialize` method.
		*/
		'_initialize': function(attributes) {

			var self = this;

			_.each(this.attributes, function(value, key) {
				self[key] = ko.observable(null);
				self[key + '_validation'] = ko.observableArray();
				/**
				 * Contains a count of the total number of validation errors that exist for this instance.
				 * @memberof NinjaModel.prototype
				 * @observable
				 */
				self.validation_errors = ko.computed(self.validationErrorCount, self);
				self[key].subscribe(function() {
					self.validate(key);
				});
			});

			self[self.idAttribute] = ko.observable();
			if (this.idAttribute !== 'id') {
				this.id = ko.computed(function() {
					return self[self.idAttribute]();
				});
			}

			this[this.idAttribute].subscribe(function(id) {
				if (!id) {
					// @todo ... ?
					return;
				}
				cache.setInstance(self);
			});

			this.initObservables();

			_.each(attributes, function(value, key) {
				self.set(key, value);
			});

		},

		'initObservables': utils.initObservables,

		/* Returns the total number of validation errors that exist for this instance. */
		'validationErrorCount': function() {
			var result = 0;
			var errors = this.getValidationErrors();
			_.each(errors, function(error) {
				result += error.length;
			});
			return result;
		},

		/**
		 * Returns an object describing all of the validation errors that exist for this instance.
		 * Usually you'll directly reference the various *_validation observables that are
		 * automatically setup. This is here mainly for debug purposes.
		 */
		'getValidationErrors': function() {
			var self = this;
			var result = {};
			var keys = _.keys(this);
			_.each(keys, function(key) {
				if (key.indexOf('_validation') > 0 && self.hasOwnProperty(key) && ko.isObservable(self[key])) {
					result[key.replace('_validation', '')] = ko.unwrap(self[key]);
				}
			});
			return result;
		},

		/**
		 * Initializes the model instance.
		 * @override
		 */
		'initialize': function() {},

		/**
		 * Sets the value of an attribute.
		 */
		'set': function(key, value) {
			if (key === this.idAttribute) {} else {
				if (!this.attributes[key]) {
					throw 'The specified attribute has not been defined for this model: ' + key;
				}
			}
			this[key](value);
		},

		/**
		 * Returns the unwrapped value for the specified attribute.
		 */
		'get': function(key) {
			if (!this.attributes[key]) {
				return undefined;
			}
			return ko.unwrap(this[key]);
		},

		/**
		 * Runs validation against any rules that have been defined for the specified
		 * attribute.
		 */
		'validate': function(key) {
			this[key + '_validation'](validator.validate(ko.unwrap(this[key]), this.attributes[key] || {}));
		},

		/**
		 * Updates this model's attributes with those found in the appropriate storage
		 * mechanism.
		 */
		'fetch': function() {
			var self = this;
			var d = utils.deferred();
			if (this.isNew()) {
				d.reject('This model is new and cannot be fetched from storage.');
			} else {
				if (this.storage) {} else {
					var props = {};
					props[this.idAttribute] = this[this.idAttribute]();
					NinjaModel.esperanto.findWhere(this.model, props).done(function(result) {
						_.each(result, function(value, key) {
							self.set(key, value);
						});
						d.resolve(self);
					}).fail(function(err) {
						d.reject(err);
					});
				}
			}
			return d.promise();
		},

		/**
		 * Creates a new record in the appropriate storage mechanism representing this
		 * model.
		 */
		'create': function() {
			var self = this;
			var d = utils.deferred();
			if (this.validationErrorCount() > 0) {
				d.reject('Validation errors exist for this instance.');
			} else {
				var data = this.toJSON();
				delete data[this.idAttribute];
				if (this.storage) {} else {
					NinjaModel.esperanto.create(this.model, data).done(function(result) {
						self.setID(result[self.idAttribute]);
						d.resolve();
					}).fail(function() {
						d.reject();
					});
				}
			}
			return d.promise();
		},

		/**
		 * Returns true / false as to whether this model has been saved (i.e. it has
		 * a unique id).
		 */
		'isNew': function() {
			if (_.isNull(this.id())) {
				return true;
			}
			return false;
		},

		/**
		 * Returns true / false as to whether the specified model instance "equals" this
		 * model.
		 */
		'equals': function(model) {
			if (this === model) {
				return true;
			}
			return false;
		},

		/**
		 * Updates an existing model. This method will throw an error if the model
		 * does not already have a value for its id attribute.
		 */
		'update': function() {
			var self = this;
			var d = utils.deferred();
			if (this.validationErrorCount() > 0) {
				d.reject('Validation errors exist for this instance.');
			} else {
				var data = this.toJSON();
				delete data[this.idAttribute];
				if (!this.id()) {
					d.reject('This model is new and cannot be updated.');
				} else {
					NinjaModel.esperanto.save(this.model, self.id(), data).done(function(result) {
						self.setID(result[self.idAttribute]);
						d.resolve();
					}).fail(function() {
						d.reject();
					});
				}
			}
			return d.promise();
		},

		/**
		 * If the model already has a value for its id attribute, this method will
		 * save the existing model. Otherwise, it will create a new instance within
		 * the appropriate storage mechanism.
		 */
		'save': function() {
			var d = utils.deferred();
			if (this.validationErrorCount() > 0) {
				d.reject('Validation errors exist for this instance.');
			} else {
				if (!this.id()) {
					return this.create();
				} else {
					return this.update();
				}
			}
			return d.promise();
		},

		/**
		 * Returns a JSON string describing the model.
		 */
		'serialize': function() {
			return JSON.stringify(this.toJSON());
		},

		/**
		 * Returns an object describing the model.
		 */
		'toJSON': function() {
			var self = this;
			var result = {};
			var keys = _.keys(this.attributes);
			_.each(keys, function(key) {
				result[key] = ko.unwrap(self[key]);
			});
			result[self.idAttribute] = ko.unwrap(self[self.idAttribute]);
			return result;
		},

		/**
		 * Removes the model from storage.
		 */
		'destroy': function() {
			var self = this;
			var d = utils.deferred();
			if (this.isNew()) {
				d.reject('This model is new and cannot be deleted.');
			} else {
				var id = this.id();
				NinjaModel.esperanto.destroy(this.model, id).done(function() {
					cache.removeInstance(this.model, id);
					self.reset();
					d.resolve(this);
				}).fail(function(err) {
					d.reject(err);
				});
			}
			return d.promise();
		},

		'setID': function(value) {
			this[this.idAttribute](value);
		},

		'reset': function() {
			var self = this;
			self[self.idAttribute](null);
			_.each(this.attributes, function(value, key) {
				self[key](null);
			});
		}

	});

	NinjaModel.extend = extend;
	NinjaModel.cache = cache;

	return NinjaModel;

});
