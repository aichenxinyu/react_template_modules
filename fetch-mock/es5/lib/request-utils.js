'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _iterator = require('babel-runtime/core-js/symbol/iterator');

var _iterator2 = _interopRequireDefault(_iterator);

var _entries = require('babel-runtime/core-js/object/entries');

var _entries2 = _interopRequireDefault(_entries);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var URL = require('whatwg-url');
// https://stackoverflow.com/a/19709846/308237
var absoluteUrlRX = new RegExp('^(?:[a-z]+:)?//', 'i');

var toArray = function toArray(headers) {
	// node-fetch 1 Headers
	if (typeof headers.raw === 'function') {
		return (0, _entries2.default)(headers.raw());
	} else if (headers[_iterator2.default]) {
		return [].concat((0, _toConsumableArray3.default)(headers));
	} else {
		return (0, _entries2.default)(headers);
	}
};

var zip = function zip(entries) {
	return entries.reduce(function (obj, _ref) {
		var _ref2 = (0, _slicedToArray3.default)(_ref, 2),
		    key = _ref2[0],
		    val = _ref2[1];

		return (0, _assign2.default)(obj, (0, _defineProperty3.default)({}, key, val));
	}, {});
};

module.exports = {
	normalizeUrl: function normalizeUrl(url) {
		if (typeof url === 'function' || url instanceof RegExp || /^(begin|end|glob|express|path)\:/.test(url)) {
			return url;
		}
		if (absoluteUrlRX.test(url)) {
			var u = new URL.URL(url);
			return u.href;
		} else {
			var _u = new URL.URL(url, 'http://dummy');
			return _u.pathname + _u.search;
		}
	},
	getPath: function getPath(url) {
		var u = absoluteUrlRX.test(url) ? new URL.URL(url) : new URL.URL(url, 'http://dummy');
		return u.pathname;
	},
	headers: {
		normalize: function normalize(headers) {
			return zip(toArray(headers));
		},
		toArray: toArray,
		zip: zip,
		toLowerCase: function toLowerCase(headers) {
			return (0, _keys2.default)(headers).reduce(function (obj, k) {
				obj[k.toLowerCase()] = headers[k];
				return obj;
			}, {});
		},
		equal: function equal(actualHeader, expectedHeader) {
			actualHeader = Array.isArray(actualHeader) ? actualHeader : [actualHeader];
			expectedHeader = Array.isArray(expectedHeader) ? expectedHeader : [expectedHeader];

			if (actualHeader.length !== expectedHeader.length) {
				return false;
			}

			return actualHeader.every(function (val, i) {
				return val === expectedHeader[i];
			});
		}
	}
};