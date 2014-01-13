# ko.ninja

## Models

### Defining a Model

The `Model` class is used to represent data objects. A model instance typically represents a row in a remote database or some other form of persistent storage.

```javascript
var Person = ko.Model.extend({
	'model': 'persons',
	'idAttribute': 'id',
	'attributes': {
		'first_name': {
			'type': 'string',
			'maxLength': 20,
			'required': true
		},
		'last_name': {
			'type': 'string',
			'maxLength': 20,
			'required': true
		},
		'email': {
			'type': 'email'
		}
	},
	'observables': {
		'full_name': function() {
			return this.first_name() + ' ' + this.last_name();
		}
	},
	'run': function() {
		console.log(this.first_name() + ' is now walking.');
	}
});
```

#### Creating a New Record

```javascript
var person = new Person();
person.set('first_name', 'Chuck');
person.set('last_name', 'Norris');
person.set('email', 'chunk.norris@gmail.com');
person.save().done(function() {
	// Success.
}).fail(function() {
	// Failure.
});
```

#### Retrieving an Existing Record

```javascript
var person = new Person({
	'id': '0d25fcd5-a76b-47cd-92bc-94d6bc2b8432'
});
person.fetch().done(function() {
	// Success
}).fail(function() {
	// Failure
});
```

#### Deleting a Record

```javascript
person.destroy().done(function() {
	// Success
}).fail(function() {
	// Failure
});
```

## Collections

The `Collection` class is used to represent a collection of model instances (e.g. a group of people, etc...). Models can easily be added to and removed from the collection. Methods can also be defined on the collection level that allow you to operate on multiple models with a single call.

### Defining a Collection

```javascript
var People = ko.Collection.extend({
	'model': Person,
	'getNames': function() {
		var names = [];
		_.each(this.models(), function(person) {
			names.push(person.full_name());
		});
		return names;
	}
});

var people = new People();
```

#### Adding a Record to a Collection

```javascript
people.push(person);
```

#### Removing a Record from a Collection

```javascript
people.remove(person);
```

#### The Collection Observable

The underlying mechanism for tracking the models that belong to a particular collection is a Knockout.JS Observable Array. The observable array can be accessed directly as shown below:

```javascript
var obs = people.models;
```

As with any other Knockout.JS observable, you can subscribe to this value to watch for future changes:

```javascript
people.models.subscribe(function(data) {
});
```
