/*global require */

require.config({
	'paths': {
		'underscore': '/underscore/underscore',
		'knockout': '/knockout.js/knockout',
		'jquery': '/jquery/jquery',
		'jqueryui': '/jqueryui/ui',
		'mockjax': '/jquery-mockjax/jquery.mockjax'
	},
	'shim': {
		'underscore': {
			'exports': '_'
		},
		'mockjax': {
			'deps': ['jquery']
		}
	}
});
