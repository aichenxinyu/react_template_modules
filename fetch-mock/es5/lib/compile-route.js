'use strict';

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _glob = require('glob-to-regexp');
var URL = require('whatwg-url');
var pathToRegexp = require('path-to-regexp');
var querystring = require('querystring');

var _require = require('./request-utils'),
    headerUtils = _require.headers,
    getPath = _require.getPath,
    normalizeUrl = _require.normalizeUrl;

var stringMatchers = {
	begin: function begin(targetString) {
		return function (url) {
			return url.indexOf(targetString) === 0;
		};
	},
	end: function end(targetString) {
		return function (url) {
			return url.substr(-targetString.length) === targetString;
		};
	},
	glob: function glob(targetString) {
		var urlRX = _glob(targetString);
		return function (url) {
			return urlRX.test(url);
		};
	},
	express: function express(targetString) {
		var urlRX = pathToRegexp(targetString);
		return function (url) {
			return urlRX.test(getPath(url));
		};
	},
	path: function path(targetString) {
		return function (url) {
			return getPath(url) === targetString;
		};
	}
};

function getHeaderMatcher(_ref) {
	var expectedHeaders = _ref.headers;

	var expectation = headerUtils.toLowerCase(expectedHeaders);
	return function (url, _ref2) {
		var _ref2$headers = _ref2.headers,
		    headers = _ref2$headers === undefined ? {} : _ref2$headers;

		var lowerCaseHeaders = headerUtils.toLowerCase(headerUtils.normalize(headers));

		return (0, _keys2.default)(expectation).every(function (headerName) {
			return headerUtils.equal(lowerCaseHeaders[headerName], expectation[headerName]);
		});
	};
}

var getMethodMatcher = function getMethodMatcher(_ref3) {
	var expectedMethod = _ref3.method;

	return function (url, _ref4) {
		var method = _ref4.method;
		return expectedMethod === (method ? method.toLowerCase() : 'get');
	};
};

var getQueryStringMatcher = function getQueryStringMatcher(_ref5) {
	var expectedQuery = _ref5.query;

	var keys = (0, _keys2.default)(expectedQuery);
	return function (url) {
		var query = querystring.parse(URL.parseURL(url).query);
		return keys.every(function (key) {
			return query[key] === expectedQuery[key];
		});
	};
};

var getParamsMatcher = function getParamsMatcher(_ref6) {
	var expectedParams = _ref6.params,
	    matcher = _ref6.matcher;

	if (!/express:/.test(matcher)) {
		throw new Error('fetch-mock: matching on params is only possible when using an express: matcher');
	}
	var expectedKeys = (0, _keys2.default)(expectedParams);
	var keys = [];
	var re = pathToRegexp(matcher.replace(/^express:/, ''), keys);
	return function (url) {
		var vals = re.exec(url) || [];
		vals.shift();
		var params = keys.reduce(function (map, _ref7, i) {
			var name = _ref7.name;
			return vals[i] ? (0, _assign2.default)(map, (0, _defineProperty3.default)({}, name, vals[i])) : map;
		}, {});
		return expectedKeys.every(function (key) {
			return params[key] === expectedParams[key];
		});
	};
};

var getUrlMatcher = function getUrlMatcher(route) {
	var matcher = route.matcher,
	    query = route.query;


	if (typeof matcher === 'function') {
		return matcher;
	}

	if (matcher instanceof RegExp) {
		return function (url) {
			return matcher.test(url);
		};
	}

	if (matcher === '*') {
		return function () {
			return true;
		};
	}

	for (var shorthand in stringMatchers) {
		if (matcher.indexOf(shorthand + ':') === 0) {
			var url = matcher.replace(new RegExp('^' + shorthand + ':'), '');
			return stringMatchers[shorthand](url);
		}
	}

	// if none of the special syntaxes apply, it's just a simple string match
	// but we have to be careful to normalize the url we check and the name
	// of the route to allow for e.g. http://it.at.there being indistinguishable
	// from http://it.at.there/ once we start generating Request/Url objects
	var expectedUrl = normalizeUrl(matcher);
	if (route.identifier === matcher) {
		route.identifier = expectedUrl;
	}

	return function (url) {
		if (query && expectedUrl.indexOf('?')) {
			return url.indexOf(expectedUrl) === 0;
		}
		return normalizeUrl(url) === expectedUrl;
	};
};

var sanitizeRoute = function sanitizeRoute(route) {
	route = (0, _assign2.default)({}, route);

	if (typeof route.response === 'undefined') {
		throw new Error('fetch-mock: Each route must define a response');
	}

	if (!route.matcher) {
		throw new Error('fetch-mock: Each route must specify a string, regex or function to match calls to fetch');
	}

	if (route.method) {
		route.method = route.method.toLowerCase();
	}
	route.identifier = route.name || route.matcher;

	return route;
};

var generateMatcher = function generateMatcher(route) {
	var matchers = [route.query && getQueryStringMatcher(route), route.method && getMethodMatcher(route), route.headers && getHeaderMatcher(route), route.params && getParamsMatcher(route), getUrlMatcher(route)].filter(function (matcher) {
		return !!matcher;
	});

	return function (url) {
		var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
		var request = arguments[2];

		return matchers.every(function (matcher) {
			return matcher(url, options, request);
		});
	};
};

var limitMatcher = function limitMatcher(route) {
	if (!route.repeat) {
		return;
	}

	var matcher = route.matcher;
	var timesLeft = route.repeat;
	route.matcher = function (url, options) {
		var match = timesLeft && matcher(url, options);
		if (match) {
			timesLeft--;
			return true;
		}
	};
	route.reset = function () {
		return timesLeft = route.repeat;
	};
};

module.exports = function (route) {
	route = sanitizeRoute(route);

	route.matcher = generateMatcher(route);

	limitMatcher(route);

	return route;
};