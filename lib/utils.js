define([
], function() {

	return {
		/**
		 * Generates a RFC 4122 Universally Unique Identifier (UID)
		 * @link http://tools.ietf.org/search/rfc4122
		 * @return {String}
		 */
		'generateUID': function() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
				return v.toString(16);
			});
		}
	};

});
