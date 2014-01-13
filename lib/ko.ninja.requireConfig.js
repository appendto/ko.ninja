require.config({
    'paths': {
        'underscore': '/underscore/underscore',
        'knockout': '/knockout.js/knockout',
        'jquery': '/jquery/jquery',
        'jqueryui': '/jqueryui/ui'
    },
    'shim': {
        'underscore': {
            'exports': '_'
        }
    },
    'packages': [
    	{
    		'name': 'esperanto',
    		'location': '/esperanto/src'
    	}
    ]
});
