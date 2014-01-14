define([
	'mockjax',
	'jquery'
], function(mockjax, $) {

	$.mockjax({
		'type': 'get',
		'url': '/api/documents.json',
		'contentType': 'text/json',
		'responseText': [
			{
				'id': 1,
				'name': 'Document One'
			}
		]
	});

	$.mockjax({
		'type': 'get',
		'url': '/api/documents/10/pages.json',
		'contentType': 'text/json',
		'responseText': [
			{
				'id': 1,
				'index': 0
			},
			{
				'id': 2,
				'index': 1
			}
		]
	});

	$.mockjax({
		'type': 'get',
		'url': '/api/documents/10/channels.json',
		'contentType': 'text/json',
		'responseText': [
			{
				'id': 1,
				'type': 'default'
			},
			{
				'id': 2,
				'type': 'email'
			}
		]
	});

	/*
	Creates a new document.
	*/
	$.mockjax({
		'type': 'post',
		'url': '/api/documents.json',
		'contentType': 'text/json',
		'responseText': {
			'id': 10,
			'name': 'Awesome Document'
		}
	});

	/*
	Retrieves a list of cats.
	*/
	$.mockjax({
		'type': 'get',
		'url': '/api/cats.json',
		'contentType': 'text/json',
		'responseText': [
			{
				'id': 1,
				'name': 'Zelda',
				'color': 'white',
				'email': 'zelda@gmail.com'
			}
		]
	});

	/*
	Creates a new cat.
	*/
	$.mockjax({
		'type': 'post',
		'url': '/api/cats.json',
		'contentType': 'text/json',
		'responseText': {
			'id': Math.floor((Math.random()*10000)+20),
			'name': 'Acorn',
			'color': 'calico',
			'email': 'acorn@gmail.com'
		}
	});

	/*
	Deletes a cat.
	*/
	$.mockjax({
		'type': 'delete',
		'url': '/api/cats/*',
		'contentType': 'text/json',
		'status': 200,
		'responseText': {}
	});

	/*
	Retrieves a specific cat.
	*/
	$.mockjax({
		'type': 'get',
		'url': '/api/cats/1.json',
		'contentType': 'text/json',
		'responseText': {
			'id': 1,
			'name': 'Zelda',
			'color': 'white',
			'email': 'zelda@gmail.com'
		}
	});

});
