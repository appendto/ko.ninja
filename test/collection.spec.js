/*global define, module, test, equal */

define([
    'knockout',
    'ko.ninja.model',
    'ko.ninja.collection'
], function (ko, Model, Collection) {

    'use strict';

    var Pet = Model.extend({
        'model': 'pet',
        'idAttribute': 'id',
        'attributes': {
            'type': {
                'type': 'string'
            },
            'name': {
                'type': 'string'
            }
        }
    });

    var Pets = Collection.extend({
        'collection': 'pets',
        'model': Pet
    });

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
        'collections': {
            'pets': Pets
        }
    });

    module('ko.Collection', {
        'setup': function() {
            localStorage.clear();
            this.person = new Person({
                'id': 1,
                'first_name': 'John',
                'last_name': 'Doe'
            });
        },
        'teardown': function() {
            localStorage.clear();
        }
    });

    test('when we add a record to the collection', function () {
        this.person.pets().push(new Pet({
            'id': 2,
            'name': 'Arthur',
            'type': 'Dog'
        }));
        equal(this.person.pets().models()[0].name(), 'Arthur');
        equal(this.person.pets()._caller.model, 'person', 'The "owner" of the pets collection should be the person model');
        equal(this.person.pets().models()[0]._caller.collection, 'pets', 'The "owner" of the pet model should be the pets collection');
    });

    test('when we add nested collections', function () {
        this.person.pets().push({
            'id': 2,
            'name': 'Arthur',
            'type': 'Dog'
        });
        equal(this.person.pets()._caller.model, 'person', 'The "owner" of the pets collection should be the person model');
        equal(this.person.pets().models()[0]._caller.collection, 'pets', 'The "owner" of the pet model should be the pets collection');
    });

    test('when getting the path for a nested model', function () {
        this.person.pets().push({
            'id': 2,
            'name': 'Arthur',
            'type': 'Dog'
        });
        equal(this.person.getPath(), '/person/1', 'The path should just be the "/person" since it is at the root');
        equal(this.person.pets().getPath(), '/person/1/pets', 'The path should just be the "/person/1/pets" since it is a nested collection');
        equal(this.person.pets().models()[0].getPath(), '/person/1/pets/2', 'The path should walk up from the model to the collection to the parent model');

        var People = Collection.extend({
            'collection': 'people',
            'model': Person
        });

        this.people = new People();

        equal(this.people.getPath(), '/people', 'The path should just be "/people" since it is not nested');

        this.people.push(this.person);

        equal(this.people.models()[0].getPath(), '/people/1', 'The path should be relative to the new collection');
        equal(this.people.models()[0].pets().models()[0].getPath(), '/people/1/pets/2', 'The path should walk up both collections and models');
    });

});