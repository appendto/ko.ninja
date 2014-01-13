/*global define */

define([
	'underscore'
], function(_) {

	'use strict';

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
