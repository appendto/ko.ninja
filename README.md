#ko.ninja
========

## Examples

### Defining a Model

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
