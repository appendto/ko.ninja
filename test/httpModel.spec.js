define([
    'ko.ninja.httpModel'
], function (Model) {

    module('ko.HttpModel', {
        setup: function () {
            this.model = new Model({
                name: 'friends',
                urlRoot: function () {
                    return '/friends/';
                },
                storage: 'http'
            });
        },
        teardown: function () {
            localStorage.clear();
        }
    });

    asyncTest('when the user attempts to find an array of records', function () {
        this.model.find(function (data) {
            equal(typeof data, 'object', 'the model should return an array');
            start();
        });
    });

    asyncTest('when the user attempts to find a single record', function () {
        this.model.findOne(1, function (data) {
            equal(data.id, '1', 'the model should find a match');
            start();
        });
    });

    asyncTest('when the user attempts to create a new record', function () {
        var self = this;
        this.model.insert({
            firstName: 'Linus',
            lastName: 'Cadenhead'
        }, function (data) {
            self.model.findOne(data.id, function (data) {
                equal(data.firstName, 'Linus', 'the model should have inserted the first name');
                equal(data.lastName, 'Cadenhead', 'the model should have inserted the last name');
                start();
            });
        });
    });

    asyncTest('when the user attempts to update an existing record', function () {
        var self = this;
        self.model.insert({
            firstName: 'Linus',
            lastName: 'Cadenhead'
        }, function (data) {
            self.model.update(data.id, {
                firstName: 'Milo',
                lastName: 'Cadenhead'
            }, function (data) {
                equal(data.firstName, 'Milo', 'the model should have been updated');
                start();
            });
        });
    });

});