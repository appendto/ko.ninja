define([
	'underscore',
	'jquery'
], function(_, $) {

	/**
	 * @class Storage
	 */
	var Storage = function() {
		this._initialize(_.toArray(arguments));
		return {
			'get': this.get.bind(this),
			'post': this.post.bind(this),
			'put': this.post.bind(this),
			'destroy': this.destroy.bind(this)
		};
	};

	_.extend(Storage.prototype, /** @lends Storage.prototype */ {

		'_initialize': function(options) {
		},

		'_req': function(method, url, data) {
			data = data || {};
			var req = {
				'url': url,
				'type': method,
				'contentType': "application/json; charset=utf-8",
				'dataType': "json",
				'data': data
			};
			return $.ajax(req);
		},

		'get': function(url, data) {
			return this._req('GET', url, data);
		},

		'post': function(url, data) {
			return this._req('POST', url, data);
		},

		'put': function(url, data) {
			return this._req('PUT', url, data);
		},

		'destroy': function(url) {
			return this._req('DELETE', url);
		}

	});

	return new Storage();

});
