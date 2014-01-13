define([
    'knockout',
    'ko.ninja.viewModel'
], function (ko, ViewModel) {


    module('ko.ViewModel', {
        setup: function () {
            var Person = ViewModel.extend({
                observables: {
                    firstName: 'Jonathan',
                    lastName: 'Creamer',
                    id: 1
                },
                model: {
                    name: 'person'
                }
            });

            this.person = new Person();

        },
        teardown: function () {
            localStorage.clear();
        }
    });

    test('creating a ViewModel', function() {
        ok(ViewModel, 'should have a ViewModel constructor');

        var Person = ViewModel.extend({
            observables: {
                firstName: '',
                lastName: '',
                fullName: function() {
                    return this.firstName() + ' ' + this.lastName();
                }
            }
        });

        var me = new Person({
            firstName: 'Jonathan',
            lastName: 'Creamer'
        });

        ok(ko.isObservable(me.firstName), 'firstName should be a ko.observable');
        equal(me.firstName(), 'Jonathan', 'should set up observables');
        equal(me.fullName(), 'Jonathan Creamer', 'should set up computed observables');

    });

});
