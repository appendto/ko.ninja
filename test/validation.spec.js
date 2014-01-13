define([
    'ko.ninja.validator',
    'underscore'
], function(validator, _) {

    module('ko.Validation', {
        setup: function () {
        }
    });

	test('maxLength', function() {

		var result = validator.validate('Tim', {
			'maxLength': 1
		});

		var err = _.findWhere(result, {
			'rule': 'maxLength'
		});

		ok(err, 'An error should be generated.');

		var result = validator.validate('Tim', {
			'maxLength': 3
		});

		var err = _.findWhere(result, {
			'rule': 'maxLength'
		});

		equal(err, undefined, 'no error should be generated.');

	});

	test('minLength', function() {

		var result = validator.validate('Tim', {
			'minLength': 5
		});

		var err = _.findWhere(result, {
			'rule': 'minLength'
		});

		ok(err, 'An error should be generated.');

		var result = validator.validate('Tim', {
			'minLength': 3
		});

		var err = _.findWhere(result, {
			'rule': 'minLength'
		});

		equal(err, undefined, 'no error should be generated.');

	});

	test('required', function() {

		var result = validator.validate('', {
			'required': true
		});

		var err = _.findWhere(result, {
			'rule': 'required'
		});

		ok(err, 'An error should be generated.');

		var result = validator.validate('Tim', {
			'required': true
		});

		var err = _.findWhere(result, {
			'rule': 'required'
		});

		equal(err, undefined, 'no error should be generated.');

	});

	test('email', function() {

		var result = validator.validate('blarg', {
			'email': true
		});

		var err = _.findWhere(result, {
			'rule': 'email'
		});

		ok(err, 'An error should be generated.');

		var result = validator.validate('tkambler@gmail.com', {
			'email': true
		});

		var err = _.findWhere(result, {
			'rule': 'email'
		});

		equal(err, undefined, 'no error should be generated.');

	});

	test('numeric', function() {

		var result = validator.validate('abc', {
			'numeric': true
		});

		var err = _.findWhere(result, {
			'rule': 'numeric'
		});

		ok(err, 'An error should be generated.');

		var result = validator.validate(500, {
			'numeric': true
		});

		var err = _.findWhere(result, {
			'rule': 'numeric'
		});

		equal(err, undefined, 'no error should be generated.');

	});

});
