/*global define, module, test, ok, equal */

define([
    'ko.ninja.validator',
    'underscore'
], function(validator, _) {

	'use strict';

    module('ko.Validation', {
        setup: function () {
        }
    });

	test('maxLength', function() {

		var result, err;

		result = validator.validate('Tim', {
			'maxLength': 1
		});

		err = _.findWhere(result, {
			'rule': 'maxLength'
		});

		ok(err, 'An error should be generated.');

		result = validator.validate('Tim', {
			'maxLength': 3
		});

		err = _.findWhere(result, {
			'rule': 'maxLength'
		});

		equal(err, undefined, 'no error should be generated.');

	});

	test('minLength', function() {

		var result, err;

		result = validator.validate('Tim', {
			'minLength': 5
		});

		err = _.findWhere(result, {
			'rule': 'minLength'
		});

		ok(err, 'An error should be generated.');

		result = validator.validate('Tim', {
			'minLength': 3
		});

		err = _.findWhere(result, {
			'rule': 'minLength'
		});

		equal(err, undefined, 'no error should be generated.');

	});

	test('required', function() {

		var result, err;

		result = validator.validate('', {
			'required': true
		});

		err = _.findWhere(result, {
			'rule': 'required'
		});

		ok(err, 'An error should be generated.');

		result = validator.validate('Tim', {
			'required': true
		});

		err = _.findWhere(result, {
			'rule': 'required'
		});

		equal(err, undefined, 'no error should be generated.');

	});

	test('email', function() {

		var result, err;

		result = validator.validate('blarg', {
			'email': true
		});

		err = _.findWhere(result, {
			'rule': 'email'
		});

		ok(err, 'An error should be generated.');

		result = validator.validate('tkambler@gmail.com', {
			'email': true
		});

		err = _.findWhere(result, {
			'rule': 'email'
		});

		equal(err, undefined, 'no error should be generated.');

	});

	test('numeric', function() {

		var result, err;

		result = validator.validate('abc', {
			'numeric': true
		});

		err = _.findWhere(result, {
			'rule': 'numeric'
		});

		ok(err, 'An error should be generated.');

		result = validator.validate(500, {
			'numeric': true
		});

		err = _.findWhere(result, {
			'rule': 'numeric'
		});

		equal(err, undefined, 'no error should be generated.');

	});

});
