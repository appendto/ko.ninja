define([
    'ko.ninja.model'
], function (Model) {

	var Person = Model.extend({
		'model': 'person',
		'idAttribute': 'id',
		'attributes': {
			'first_name': {
				'type': 'string'
			},
			'last_name': {
				'type': 'string'
			}
		},
		'observables': {
		}
	});

	module('ko.Model', {
		'setup': function() {
			localStorage.clear();
			this.person = new Person({
				'first_name': 'John',
				'last_name': 'Doe'
			});
		},
		'teardown': function() {
			localStorage.clear();
		}
	});

	asyncTest('when updating data', function() {

		var self = this;

		this.person.save().done(function() {

			var id = self.person.id();
			var first_name = 'Jane';
			var last_name = 'Smith';
			self.person.set('first_name', 'Jane');
			self.person.set('last_name', 'Smith');

			self.person.save().done(function() {
				equal(self.person.id(), id, 'the id should remain the same');
				equal(self.person.first_name(), first_name, 'Jane', 'it should set first_name');
				equal(self.person.last_name(), last_name, 'Smith', 'it should set last_name');
				start();
			}).fail(function() {
				ok(false, 'the returned promise should not fail.');
				start();
			});

		});

	});

	asyncTest('when deleting data', function() {

		var self = this;

		this.person.save().done(function() {
			self.person.destroy().done(function() {
				equal(self.person.id(), null, 'id should be null');
				equal(self.person.first_name(), null, 'first_name should be null');
				equal(self.person.last_name(), null, 'last_name should be null');
				start();
			}).fail(function() {
				ok(false, 'the returned promise should not fail.');
				start();
			});
		});

	});

	asyncTest('when finding a specific record', function() {

		var self = this;

		this.person.save().done(function() {
			var id = self.person.id();
			var person = new Person({
				'id': id
			});
			person.fetch().done(function() {
				equal(person.id(), self.person.id(), 'the fetched record should have the same id as the original record');
				start();
			}).fail(function() {
				ok(false, 'the promise from the fetch operation should not fail.');
				start();
			});
		});

	});

});
