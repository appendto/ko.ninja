
/*global define */

(function (root, factory) {
    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja.events',[
            'underscore'
        ], factory);

    // Non-AMD
    } else {
        factory(root._, root.ko);
    }

} (this, function (_, ko) {

    

    // Regular expression used to split event strings.
    var eventSplitter = /\s+/,
        Events, eventsApi, listenMethods, triggerEvents;

    // Implement fancy features of the Events API such as multiple event
    // names `"change blur"` and jQuery-style event maps `{change: action}`
    // in terms of the existing API.
    eventsApi = function(obj, action, name, rest) {
        if (!name) return true;

        // Handle event maps.
        if (typeof name === 'object') {
            for (var key in name) {
                obj[action].apply(obj, [key, name[key]].concat(rest));
            }
            return false;
        }

        // Handle space separated event names.
        if (eventSplitter.test(name)) {
            var names = name.split(eventSplitter);
            for (var i = 0, l = names.length; i < l; i++) {
                obj[action].apply(obj, [names[i]].concat(rest));
            }
            return false;
        }

        return true;
    };

    // A difficult-to-believe, but optimized internal dispatch function for
    // triggering events. Tries to keep the usual cases speedy (most internal
    // Backbone events have 3 arguments).
    triggerEvents = function(events, args) {
        var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
        switch (args.length) {
            case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
            case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
            case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
            case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
            default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
        }
    };

    /**
    * The events manager
    *
    * @class app.events
    */
    Events = {
        /**
         * Bind an event to a `callback` function. Passing `"all"` will bind
         * the callback to all events fired.
         * @method on
         * @param  {String} name Name of the event to subscribe to
         * @param  {Function} callback Callback to fire when the event fires
         * @param  {[type]} context Sets the context of the callback
         * @return Returns `this`
         */
        on: function(name, callback, context) {
            if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
            this._events = this._events || (this._events = {});
            var events = this._events[name] || (this._events[name] = []);
            events.push({callback: callback, context: context, ctx: context || this});
            return this;
        },

        /**
         * Bind an event to only be triggered a single time. After the first time
         * the callback is invoked, it will be removed.
         * @method once
         * @param  {String} name Name of the event to subscribe to
         * @param  {Function} callback Callback to fire when the event fires
         * @param  {[type]} context Sets the context of the callback
         * @return Returns `this`
         */
        once: function(name, callback, context) {
            if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
            var self = this;
            var once = _.once(function() {
                self.off(name, once);
                callback.apply(this, arguments);
            });
            once._callback = callback;
            return this.on(name, once, context);
        },

        
        /**
         * Remove one or many callbacks. If `context` is null, removes all
         * callbacks with that function. If `callback` is null, removes all
         * callbacks for the event. If `name` is null, removes all bound
         * callbacks for all events.
         * @method off
         * @param  {String} name Name of the event to turn off
         * @param  {Function} callback Callback to turn off
         * @param  {[type]} context Sets the context of the callback
         * @return Returns `this`
         */
        off: function(name, callback, context) {
            var retain, ev, events, names, i, l, j, k;
            if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
            if (!name && !callback && !context) {
                this._events = {};
                return this;
            }

            names = name ? [name] : _.keys(this._events);
            for (i = 0, l = names.length; i < l; i++) {
                name = names[i];
                if (events === this._events[name]) {
                    this._events[name] = retain = [];
                    if (callback || context) {
                        for (j = 0, k = events.length; j < k; j++) {
                            ev = events[j];
                            if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                                (context && context !== ev.context)) {
                                retain.push(ev);
                            }
                        }
                    }
                    if (!retain.length) delete this._events[name];
                }
            }

            return this;
        },

        /**
         * Trigger one or many events, firing all bound callbacks. Callbacks are
         * passed the same arguments as `trigger` is, apart from the event name
         * (unless you're listening on `"all"`, which will cause your callback to
         * receive the true name of the event as the first argument).
         * @method trigger
         * @param  {String} name The name of the event to trigger
         * @return Returns `this`
         */
        trigger: function(name) {
            if (!this._events) return this;
            var args = Array.prototype.slice.call(arguments, 1);
            if (!eventsApi(this, 'trigger', name, args)) return this;
            var events = this._events[name];
            var allEvents = this._events.all;
            if (events) triggerEvents(events, args);
            if (allEvents) triggerEvents(allEvents, arguments);
            return this;
        },

        /**
         * Tell this object to stop listening to either specific events ... or
         * to every object it's currently listening to.
         * @method stopListening
         * @param  {Object} obj Object to stop listening to events on
         * @param  {String} name Name of the event to stop listening for
         * @param  {Function} callback
         * @return Returns `this`
         */
        stopListening: function(obj, name, callback) {
            var listeners = this._listeners;
            if (!listeners) return this;
            var deleteListener = !name && !callback;
            if (typeof name === 'object') callback = this;
            if (obj) (listeners = {})[obj._listenerId] = obj;
            for (var id in listeners) {
                listeners[id].off(name, callback, this);
                if (deleteListener) delete this._listeners[id];
            }
            return this;
        }
    };

    listenMethods = {
        listenTo: 'on',
        listenToOnce: 'once'
    };

    // Inversion-of-control versions of `on` and `once`. Tell *this* object to
    // listen to an event in another object ... keeping track of what it's
    // listening to.
    _.each(listenMethods, function(implementation, method) {
        Events[method] = function(obj, name, callback) {
            var listeners = this._listeners || (this._listeners = {});
            var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
            listeners[id] = obj;
            if (typeof name === 'object') callback = this;
            obj[implementation](name, callback, this);
            return this;
        };
    });

    if (typeof define === 'function' && define.amd) {
        return Events;
    } else {
        ko.ninjaEvents = Events;
    }

}));
/*global define */

(function (root, factory) {
    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja.extend',[
            'underscore'
        ], factory);

    // Non-AMD
    } else {
        factory(root._, root.ko);
    }

} (this, function (_, ko) {

    

    var Extend = function(protoProps, staticProps) {
        var parent = this,
            Surrogate,
            child;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent's constructor.
        if (protoProps && _.has(protoProps, 'constructor')) {
            child = protoProps.constructor;
        } else {
            child = function() { return parent.apply(this, arguments); };
        }

        // Add static properties to the constructor function, if supplied.
        _.extend(child, parent, staticProps);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        Surrogate = function(){ this.constructor = child; };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate();

        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (protoProps) {
            _.extend(child.prototype, protoProps);
        }

        // Set a convenience property in case the parent's prototype is needed
        // later.
        child.__super__ = parent.prototype;

        if (protoProps.name) {
            child.prototype.toString = function() {
                return protoProps.name;
            };
        }

        return child;
    };

    if (typeof define === 'function' && define.amd) {
        return Extend;
    } else {
        ko.ninjaExtend = Extend;
    }

}));
/*global define */

(function (root, factory) {
    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja.baseModel',[
            'underscore',
            'ko.ninja.events',
            'ko.ninja.extend'
        ], factory);

    // Non-AMD
    } else {
        factory(root._, root.ko.ninjaEvents, root.ko.ninjaExtend, root.ko);
    }

} (this, function (_, Events, extend, ko) {

    

    //### ko.BaseModel
    var BaseModel = function (options) {

        options = options || {};

        if (_.isFunction(this.initialize)) {
            this.initialize(options);
        }
        
        _.extend(this, Events, {

            idAttribute: 'id',

            invalid: function () {
                if (!localStorage) {
                    return {
                        error: true,
                        message: 'There is no localStorage available in this context'
                    };
                }

                if (!this.name) {
                    return {
                        error: true,
                        message: 'This model has no name. Every model needs a name'
                    };
                }
            },

            save: function (data, done) {
                if (data[this.idAttribute]) {
                    return this.update(data[this.idAttribute], data, done);
                } else {
                    return this.insert(data, done);
                }
            }
            
        }, options);


    };

    BaseModel.extend = extend;

    if (typeof define === 'function' && define.amd) {
        return BaseModel;
    } else {
        ko.ninjaBaseModel = BaseModel;
    }

}));
/*global define */

(function (root, factory) {
    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja.localStorageModel',[
            'ko.ninja.baseModel'
        ], factory);

    // Non-AMD
    } else {
        factory(root.ko.ninjaBaseModel, root.ko);
    }

} (this, function (BaseModel, ko) {

    

    var LocalStorageModel = BaseModel.extend({

        find: function (data, done) {
            var response = [], match;

            done = done || data;

            if (!this.invalid()) {
                for(var key in localStorage) {
                    if (~key.indexOf(this.name + '-')) {
                        match = true;
                        for (var value in data) {
                            if (data[value] !== JSON.parse(localStorage[key])[value]) {
                                match = false;
                            }
                        }
                        if (match) {
                            response.push(JSON.parse(localStorage.getItem(key)));
                        }
                    }
                }
                done(response);

            } else {
                done(this.invalid(data));
            }
        },

        findOne: function (id, done) {
            if (!this.invalid()) {
                done(JSON.parse(localStorage[this.name + '-' + id] || '{}'));
                
            } else {
                done(this.invalid());
            }
        },

        insert: function (data, done) {
            done = done || function () {};
            data[this.idAttribute] = new Date().getTime();
            if (!this.invalid(data)) {
                localStorage[this.name + '-' + data.id] = JSON.stringify(data);
                done(data);
            } else {
                done(this.invalid(data));
            }
        },

        remove: function (id, done) {
            done = done || function () {};
            if (!this.invalid()) {
                delete localStorage[this.name + '-' + id];
                done(null);
            } else {
                done(this.invalid());
            }
        },

        update: function (id, data, done) {
            done = done || function () {};
            if (!this.invalid(data)) {
                data[this.idAttribute] = id;
                localStorage[this.name + '-' + id] = JSON.stringify(data);
                done(data);
            } else {
                done(this.invalid(data));
            }
        }

    });

    if (typeof define === 'function' && define.amd) {
        return LocalStorageModel;
    } else {
        ko.ninjaLocalStorageModel = LocalStorageModel;
    }

}));
/*global define */

define('validator',[
	'underscore'
], function(_) {

	

	return {
		/**
		 * Array containing the names of every supported validation rule.
		 */
		'supported_rules': ['required', 'minLength', 'maxLength'],
		/**
		 * Returns an array containing a description of every validator error that is
		 * found (if any).
		 */
		'validate': function(value, rules) {
			var self = this;
			rules = rules || {};
			var errors = [];
			_.find(rules, function(rule, name) {
				if ( self.supported_rules.indexOf(name) < 0 ) {
					return false;
				}
				var err = self.rules[name].call(this, rule, value);
				if ( err !== true ) {
					errors.push(err);
				}
			});
			return errors;
		},

		/*
		The following validation methods must return `true` if no error is found. Otherwise,
		they must return a string that describes the error in a user-presentable manner.
		Referenced the rules used by Sails as a guide: http://sailsjs.org/#!documentation/models
		*/
		'rules': {

			'required': function(rule_value, value) {
				if ( rule_value !== true ) {
					return true;
				}
				if ( _.isNull(value) || value === '' ) {
					return 'This is a required field.';
				} else {
					return true;
				}
			},

			'maxLength': function(rule_value, value) {
				if ( value && value.length <= rule_value ) {
					return true;
				}
				return 'The maximum length allowed is ' + rule_value + ' characters.';
			},

			'minLength': function(rule_value, value) {
				if ( value && value.length >= rule_value ) {
					return true;
				}
				return 'The minimum length allowed is ' + rule_value + ' characters.';
			},

			'string': function(rule_value, value) {
				if ( _.isString(value) ) {
					return true;
				}
				return 'This value must be a string.';
			},

			'alpha': function(rule_value, value) {
				if ( /[^a-zA-Z0-9]/.test(value) ) {
					return true;
				}
				return 'This value must contain only alphabetic characters.';
			},

			'numeric': function(rule_value, value) {
				if ( /[^0-9]/.test(value) ) {
					return true;
				}
				return 'This value must be numeric.';
			},

			'alphanumeric': function(rule_value, value) {
				if ( /[^a-zA-Z0-9]/.test(value) ) {
					return true;
				}
				return 'This value must be alphanumeric.';
			},

			'email': function(rule_value, value) {
				var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
				if ( filter.test(value) ) {
					return true;
				} else {
					return 'This value must be a valid email address.';
				}
			},

			'url': function() {
				return true;
			},

			'urlish': function() {
				return true;
			},

			'ip': function() {
				return true;
			},

			'ipv4': function() {
				return true;
			},

			'ipv6': function() {
				return true;
			},

			'creditcard': function() {
				return true;
			},

			'int': function(rule_value, value) {
				return this.integer(rule_value, value);
			},

			'integer': function(rule_value, value) {
				if ( !_.isNumber(value) || Math.floor(value) !== value ) {
					return 'This value must be an integer.';
				}
				return true;
			},

			'number': function(rule_value, value) {
				if ( _.isNumber(value) ) {
					return true;
				}
				return 'This value must be a number.';
			},

			'decimal': function() {
				return true;
			},

			'float': function() {
				return true;
			},

			'falsey': function(rule_value, value) {
				if ( !value ) {
					return true;
				}
				return 'This value must be \'falsey.\'';
			},

			'truthy': function (rule_value, value) {
				if ( value ) {
					return true;
				}
				return 'This value must be \'truthy.\'';
			},

			'boolean': function (rule_value, value) {
				if ( _.isBoolean(value) ) {
					return true;
				}
				return 'This value must be a boolean.';
			},

			'date': function () {
				return true;
			},

			'hexColor': function() {
				return true;
			},

			'lowercase': function(rule_value, value) {
				var tmp = value.toLowerCase();
				if ( tmp === value ) {
					return true;
				}
				return 'This value must be entirely lowercase.';
			},

			'uppercase': function(rule_value, value) {
				var tmp = value.toUpperCase();
				if ( tmp === value ) {
					return true;
				}
				return 'This value must be entirely uppercase.';
			},

			'min': function(rule_value, value) {
				if ( value >= rule_value ) {
					return true;
				}
				return 'The minimum allowed value is: ' + rule_value;
			},

			'max': function(rule_value, value) {
				if ( value <= rule_value ) {
					return true;
				}
				return 'The maximum allowed value is: ' + rule_value;
			},

			'regex': function() {
				return true;
			},

			'notRegex': function() {
				return true;
			},

			'equals': function(rule_value, value) {
				if ( value === rule_value ) {
					return true;
				}
				return 'Required value: ' + rule_value;
			},

			'in': function(rule_value, value) {
				if ( rule_value.indexOf(value) < 0 ) {
					return 'The follow values are allowed: ' + rule_value.join(', ');
				}
				return true;
			},

			'notIn': function(rule_value, value) {
				if ( rule_value.indexOf(value) >= 0 ) {
					return 'The follow values are not allowed: ' + rule_value.join(', ');
				}
				return true;
			}

		}

	};

});

/**
 * @module dataStore
 */
define('esperanto/main',['require','exports','module','underscore'],function(require, exports, module) {

	var _ = require('underscore');

	/**
	 * @class DataStore
	 *
	 * The DataStore class presents a consistent API that can be applied to multiple types
	 * of storage engines. Plugins currently exist for localStorage and sessionStorage. We
	 * can create plugins for querying against a remote data source when the time comes and
	 * seamlessly transition over.
	 */
	var DataStore = function() {
		this.init.apply(this, _.toArray(arguments));
		/* Public API */
		return {
			/**
			 * Looks through each value in the collection, returning an array of all the values that contain all of the key-value pairs listed in properties.
			 * @tutorial datastore_where
			 * @method
			 * @memberof DataStore
			 * @param {String} collection - The name of the collection to be queried.
			 * @param {Object} props - An object of key / value pairs against which the collection will be queried.
			 * @return {Promise}
			 */
			'where': this.internalAPI.where.bind(this),
			/**
			 * Looks through the collection and returns the first value that matches all of the key-value pairs listed in properties.
			 * @tutorial datastore_findwhere
			 * @method
			 * @memberof DataStore
			 * @param {String} collection - The name of the collection to be queried.
			 * @param {Object} props - An object of key / value pairs against which the collection will be queried.
			 * @return {Promise}
			 */
			'findWhere': this.internalAPI.findWhere.bind(this),
			/**
			 * Updates the attributes of an existing item, given the specified UID.
			 * @tutorial datastore_save
			 * @method
			 * @memberof DataStore
			 * @param {String} collection - The name of the collection to be queried.
			 * @param {String} id - The UID of the existing entry to be saved.
			 * @param {Object} props - An object of key / value pairs that will comprise the updated entry.
			 * @return {Promise}
			 */
			'save': this.internalAPI.save.bind(this),
			/**
			 * Creates a new entry within the collection.
			 * @tutorial datastore_create
			 * @method
			 * @memberof DataStore
			 * @param {String} collection - The name of the collection to be queried.
			 * @param {Object} props - An object of key / value pairs that will comprise the new entry.
			 * @return {Promise}
			 */
			'create': this.internalAPI.create.bind(this),
			/**
			 * Deletes the specified collection entry.
			 * @tutorial datastore_destroy
			 * @method
			 * @memberof DataStore
			 * @param {String} collection - The name of the collection to be queried.
			 * @param {String} id - The UID of the existing entry to be deleted.
			 * @return {Promise}
			 */
			'destroy': this.internalAPI.destroy.bind(this),
			/**
			 * Returns an array containing every entry within the specified collection.
			 * @tutorial datastore_getallmodels
			 * @method
			 * @memberof DataStore
			 * @param {String} collection - The name of the collection to be queried.
			 * @return {Promise}
			 */
			'getAllModels': this.internalAPI.getAllModels.bind(this)
		};
	};

	_.extend(DataStore.prototype,
		/** @lends DataStore.prototype */
		{
		'source': 'localStorage',
		'supportedSources': ['localStorage', 'sessionStorage'],
		'init': function(source) {
			if ( source ) {
				this.setSource(source);
			}
			this.initStorage();
		},
		'setSource': function(source) {
			if ( this.supportedSources.indexOf(source) < 0 ) {
				throw 'Invalid data source specified: ' + source;
			}
		},
		'initStorage': function() {
			switch ( this.source ) {
				case 'localStorage' :
					var API = new require('./lib/localStorage');
					this.internalAPI = new API();
					break;
				case 'sessionStorage' :
					this.internalAPI = new require('./lib/sessionStorage');
					break;
			}
		}
	});

	return DataStore;

});

define('esperanto', ['esperanto/main'], function (main) { return main; });

/*global define */

define('ko.ninja.deferred',[],function () {

    

    var Deferred = function () {
      this.callbacks = [];
    };
     
    Deferred.prototype = {
      err: 0,
      x: 0,
     
      $: function(arr) {
        this.callbacks.push(arr);
        if(this.x === 2) {
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
        if(!this.x) {
            this.err = 1;
            this._(obj);
        }
        return this;
      },
     
      resolve: function(obj) {
        if(!this.x) {
            this._(obj);
        }
        return this;
      },
     
      _: function(obj) {
        this.x = 1;
        for(var state = this.err, cb = this.callbacks, method = cb.shift(), value = obj; method; ) {
          try {
            while(method) {
                (method = method[2] || (state ? method[1] : method[0])) && (value = method(value || obj)); // jshint ignore:line
                
              if(value instanceof Deferred) {
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
          } catch(e) {
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
      if(!args) return m;
     
      args = [].slice.call(arguments);
      m = new Deferred();
     
      var i = args.length,
        n = i,
        res = [],
        done = function(j) {
            return function (v) {
                res[j] = v;
                if(!--n) {
                    m.resolve(res);
                }
            };
        },
        fail = function (v) {
            m.reject(v);
        };
     
      while(i--) args[i].then(done(i), fail);
      return m;
    };

    return Deferred;
});
/*global define, $ */

define('ko.ninja.utils',[
	'ko.ninja.deferred'
], function(Deferred) {

	

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

		'deferred': function (options) {
			if (typeof window.$ === 'object') {
				return $.Deferred(options);
			} else {
				return new Deferred(options);
			}
		}
	};

});

/*global define */

define('ko.ninja.model',[
	'underscore',
	'knockout',
    'ko.ninja.extend',
    'ko.ninja.localStorageModel',
    'validator',
    'esperanto',
    'ko.ninja.utils'
], function(_, ko, extend, LocalStorageModel, validator, Esperanto, utils) {

	

	/**
	 * Ensures we never instantiate two separate instances of the same model.
	 */
	var cache = {

		'models': {
		},

		/**
		 * Searches the cache for an instance of the specified model type with the given id.
		 * Returns the instance, or null if nothing is found.
		 */
		'getInstance': function(model, id) {
			if ( !this.models[model] ) {
				return null;
			}
			if ( this.models[model][id]) {
				return this.models[model][id];
			}
			return null;
		},

		/**
		 * Stores a model instance in the cache.
		 */
		'setInstance': function(model) {
			if ( !(model instanceof NinjaModel) ) {
				throw 'Invalid model specified.';
			}
			if ( !model.id() ) {
				throw 'Model does not have a value set for id.';
			}
			if ( !this.models[model.model] ) {
				this.models[model.model] = {};
			}
			this.models[model.model][model.id()] = model;
		},

		/**
		 * Removes a model instance from the cache.
		 */
		'removeInstance': function(model, id) {
			if ( !this.models[model] ) {
				return null;
			}
			if ( this.models[model][id]) {
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

		if ( !NinjaModel.esperanto_initialized ) {
			NinjaModel.initializeEsperanto();
		}

		var options = _.toArray(arguments);
		var attributes = _.first(options);

		if ( _.isObject(attributes) && !_.isArray(attributes) ) {
		} else if ( _.isString(attributes) || _.isNumber(attributes) ) {
			var attrs = {};
			attrs[this.idAttribute] = attributes;
			attributes = attrs;
		} else if ( !attributes ) {
			attributes = {};
		} else {
			throw 'Invalid model attributes specified.';
		}

		var defaults = {};
		defaults[this.idAttribute] = null;
		_.defaults(attributes, defaults);

		var cached = cache.getInstance(this.model, attributes[this.idAttribute]);
		if ( cached ) {
			return cached;
		}

		options.splice(0, 1, attributes);

		this._initialize.apply(this, options);
		if ( _.isFunction(this.initialize) ) {
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
		switch ( NinjaModel.storage.method ) {
			case 'localStorage' :
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
			if ( this.idAttribute !== 'id' ) {
				this.id = ko.computed(function() {
					return self[self.idAttribute]();
				});
			}

			this[this.idAttribute].subscribe(function(id) {
				if ( !id ) {
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
				if ( key.indexOf('_validation') > 0 && self.hasOwnProperty(key) && ko.isObservable(self[key]) ) {
					result[key.replace('_validation', '')] = ko.unwrap(self[key]);
				}
			});
			return result;
		},

		/**
		 * Initializes the model instance.
		 * @override
		 */
		'initialize': function() {
		},

		/**
		 * Sets the value of an attribute.
		 */
		'set': function(key, value) {
			if ( key === this.idAttribute ) {
			} else {
				if ( !this.attributes[key] ) {
					throw 'The specified attribute has not been defined for this model: ' + key;
				}
			}
			this[key](value);
		},

		/**
		 * Returns the unwrapped value for the specified attribute.
		 */
		'get': function(key) {
			if ( !this.attributes[key] ) {
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
			if ( this.isNew() ) {
				d.reject('This model is new and cannot be fetched from storage.');
			} else {
				if ( this.storage ) {
				} else {
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
			if ( this.validationErrorCount() > 0 ) {
				d.reject('Validation errors exist for this instance.');
			} else {
				var data = this.toJSON();
				delete data[this.idAttribute];
				if ( this.storage ) {
				} else {
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
			if ( _.isNull(this.id()) ) {
				return true;
			}
			return false;
		},

		/**
		 * Returns true / false as to whether the specified model instance "equals" this
		 * model.
		 */
		'equals': function(model) {
			if ( this === model ) {
				return true;
			}
			return false;
		},

		/**
		 * Updates an existing model. This method will throw an error if the model
		 * does not already have a value for its id attribute.
		 */
		'update': function() {
			var d = utils.deferred();
			if ( this.validationErrorCount() > 0 ) {
				d.reject('Validation errors exist for this instance.');
			} else {
				if ( !this.id() ) {
					d.reject('This model is new and cannot be updated.');
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
			if ( this.validationErrorCount() > 0 ) {
				d.reject('Validation errors exist for this instance.');
			} else {
				if ( !this.id() ) {
					return this.create();
				} else {
					if ( this.storage ) {
					} else {
					}
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
			var d = utils.deferred();
			if ( this.isNew() ) {
				d.reject('This model is new and cannot be deleted.');
			} else {
				var id = this.id();
				NinjaModel.esperanto.destroy(this.model, id).done(function() {
					cache.removeInstance(this.model, id);
					d.resolve(this);
				}).fail(function(err) {
					d.reject(err);
				});
			}
			return d.promise();
		},

		'setID': function(value) {
			this[this.idAttribute](value);
		}

	});

	NinjaModel.extend = extend;
	NinjaModel.cache = cache;

	return NinjaModel;

});

/*global define */

(function (root, factory) {
    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja.validation',[
            'knockout',
            'underscore'
        ], factory);

    // Non-AMD
    } else {
        factory(root.ko, root._);
    }

} (this, function (ko, _) {

    

    var validation = {

        validationTypes: {

            _custom: function (value, config) {
                return config.validator.call(this, value, config);
            },

            _maxLength: function (value, config) {
                return value.length > config.value;
            },

            _minLength: function (value, config) {
                return value.length < config.value;
            },

            _length: function (value, config) {
                return value.length !== config.value;
            },

            _required: function (value) {
                return !value || !value.length;
            },

            _email: function (value) {
                return !/[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);
            },

            _number: function (value) {
                return !(!isNaN(parseFloat(value)) && isFinite(value));
            }

        },

        _validate: function (validations, observable) {
            var value = (this[observable]) ? this[observable]() : null,
                errors = [];
            _.each(validations, function (config, name) {
                if (this.validationTypes['_' + name]) {
                    var inavalid = this.validationTypes['_' + name].call(this, value, config);
                    if (inavalid) {
                        if (typeof config === 'string') {
                            config = {
                                message: config
                            };
                        }
                        errors.push({
                            observable: observable,
                            error: config.message
                        });
                    }
                }
            }, this);
            return errors;
        },

        validateOne: function (observable) {
            var invalid = this._validate(this.validation[observable], observable);
            if (invalid.length) {
                return invalid[0].error;
            }
        },

        validateAll: function () {
            var errors = [];
            _.each(this.validation, function (validations, observable) {
                errors = errors.concat(this._validate(validations, observable));
            }, this);
            return errors;
        },

        validate: function () {
            var errors = {};
            this.errors(this.validateAll());
            _.each(this.errors(), function (error) {
                if (!errors[error.observable]) {
                    this[error.observable].error(error.error);
                    errors[error.observable] = true;
                }
            }, this);
            return (this.errors().length) ? this.errors() : null;
        },

        watchValidation: function (observable) {
            if (this[observable]) {
                this[observable].error = ko.observable();
                this[observable].subscribe(function () {
                    this[observable].error(this.validateOne(observable));
                    this.errors(this.validateAll());
                }.bind(this));
            }
        },

        watchValidations: function () {
            this.errors = ko.observableArray();
            _.each(this.validation, function (validation, observable) {
                this.watchValidation(observable);
            }, this);
        }

    };

    if (typeof define === 'function' && define.amd) {
        return validation;
    } else {
        ko.ninjaValidation = validation;
    }

}));
/*global define */

(function (root, factory) {
    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja.viewModel',[
            'knockout',
            'underscore',
            'ko.ninja.events',
            'ko.ninja.extend',
            'ko.ninja.model',
            'ko.ninja.validation'
        ], factory);

    // Non-AMD
    } else {
        factory(root.ko, root._, root.ko.ninjaEvents, root.ko.ninjaExtend, root.ko.ninjaModel, root.ko.ninjaValidation);
    }

} (this, function (ko, _, Events, extend, Model, Validation) {

    

    var setupObservables = function(options) {
        var computedObservables = _.functions(this.observables);

        computedObservables = _.reduce(this.observables, function(memo, value, prop) {
            if (_.isObject(value) && !_.isArray(value) && (value.read || value.write)) {
                memo.push(prop);
            }
            return memo;
        }, computedObservables);

        // Process the observables first
        _.each(_.omit(this.observables, computedObservables), function (value, prop) {
            if (_.isArray(value)) {
                if (ko.isObservable(options[prop])) {
                    this[prop] = options[prop];
                }
                else {
                    this[prop] = ko.observableArray((options[prop] || value).slice(0));
                }
            }
            else {
                if (ko.isObservable(options[prop])) {
                    this[prop] = options[prop];
                }
                else {
                    this[prop] = ko.observable(options[prop] || value);
                }
            }

            this[prop].subscribe(function(value) {
                this.trigger('change:' + prop, value);
            }, this);
        }, this);

        // Now process the computedObservables
        _.each(_.pick(this.observables, computedObservables), function(value, prop) {
            this[prop] = ko.computed({
                read: this.observables[prop],
                write: function () {
                    // Keeps it from breaking.
                    // Perhaps we need a way to allow writing to computed observables, though
                },
                owner: this
            }, this);
        }, this);
    };

    var setupValidation = function() {

    };

    var setupModel = function () {
        var self = this,
            sync = function () {
                var data = {};
                _.each(self.observables, function (val, name) {
                    data[name] = self[name]();
                });
                self.model.save(data, function () {});
            }, debounceSync = _.debounce(sync, 1);

        if (!this.model.status) {
            this.model = new Model(this.model);
        }

        // This keeps the model from autoSyncing if the viewModel has autoSync: false
        // defined on it.
        if (this.autoSync !== false) {
            this.autoSync = true;
        }

        this.fetch = function (done) {
            var self = this,
                autoSync = this.autoSync;

            this.autoSync = false;
            this.model.findOne(this[this.idAttribute || 'id'](), function (data) {
                _.each(data, function (value, name) {
                    if (typeof self[name] === 'function') {
                        self[name](value);
                    }
                });
                self.autoSync = autoSync;
                if (_.isFunction(done)) {
                    done();
                }
            });
        };

        _.each(this.observables, function (val, name) {
            self[name].subscribe(function () {
                if (self.autoSync && !self.validateAll().length) {
                    debounceSync();
                }
            });
        });
    };

    //### ko.ViewModel
    var ViewModel = function ViewModel(options) {

        options = options || {};

        setupObservables.call(this, options);

        this.watchValidations();

        if (this.validation) {
            setupValidation.call(this);
        }

        this.initialize.apply(this, arguments);

        if (this.model) {
            setupModel.call(this, options);
        }

        if (this.autoSync) {
            this.fetch();
        }

        if (this.el) {
            ko.applyBindings(this, (typeof this.el === 'object') ? this.el : document.querySelector(this.el)[0]);
        }

    };

    _.extend(ViewModel.prototype, Events, Validation, {
        initialize: function() {}
    });

    ViewModel.extend = extend;

    if (typeof define === 'function' && define.amd) {
        return ViewModel;
    } else {
        ko.ninjaViewModel = ViewModel;
    }

}));
/*global define */

define('ko.ninja.collection',[
	'underscore',
	'knockout',
	'ko.ninja.model',
    'ko.ninja.extend',
    'ko.ninja.localStorageModel',
    'validator',
    'esperanto',
    'ko.ninja.utils'
], function(_, ko, NinjaModel, extend, utils) {

	

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
		}

	});

	NinjaCollection.extend = extend;

	return NinjaCollection;

});

/*global define */

(function (root, factory) {
    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja',[
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

} (this, function (_, ko, ViewModel, Model, Collection) {

    

	ko.Collection = Collection;
    ko.ViewModel = ViewModel;
    ko.Model = Model;

	return ko;

}));
