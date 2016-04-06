'use strict';
var assert = require('assertive');

var fetch = require('../..').fetch;

var withMockService = require('../mock-service');

function unexpected() {
  throw new Error('Should not happen');
}

describe('fetch: the basics', function () {
  var options = withMockService();

  it('can load using just a url string', function () {
    return fetch(options.baseUrl)
      .then(function (res) {
        assert.equal(200, res.statusCode);
      });
  });

  it('can load using path and baseUrl option', function () {
    return fetch('/text/path', { baseUrl: options.baseUrl })
      .then(function (res) {
        assert.equal(200, res.statusCode);
      });
  });

  it('has a convenience .json method', function () {
    return fetch('/echo', options)
      .json().then(function (echo) {
        assert.equal('GET', echo.method);
        assert.equal('/echo', echo.url);
      });
  });

  it('exposes the response body on status code error object', function () {
    return fetch('/json/404', options)
      .json().then(unexpected, function (error) {
        assert.truthy(error.body);
        // The response body constains a request mirror just like /echo
        assert.equal('GET', error.body.method);
      });
  });

  it('can add query string arguments', function () {
    return fetch('/echo?y=url&z=bar', {
      baseUrl: options.baseUrl,
      qs: { x: [1, 'foo'], y: 'qs' },
    }).json()
      .then(function (echo) {
        assert.equal('/echo?y=qs&z=bar&x[0]=1&x[1]=foo',
          decodeURIComponent(echo.url));
      });
  });

  it('throws when the url is not a string', function () {
    assert.equal(
      'url has to be a string',
      assert.throws(function () { fetch(); }).message);

    assert.equal(
      'url has to be a string',
      assert.throws(function () { fetch(true); }).message);

    assert.equal(
      'url has to be a string',
      assert.throws(function () { fetch(null); }).message);
  });

  it('throws when the baseUrl contains a query string', function () {
    var error = assert.throws(function () {
      fetch('/text/path', { baseUrl: options.baseUrl + '?x=1' });
    });
    assert.equal('baseUrl may not contain a query string', error.message);
  });

  describe('legacy / callback mode', function () {
    var returnValue;
    var error;
    var data;
    var response;

    before(function (done) {
      returnValue = fetch('/echo', options, function (_error, _data, _response) {
        error = _error;
        data = _data;
        response = _response;
        done(error);
      });
    });

    it('returns undefined', function () {
      assert.equal(undefined, returnValue);
    });

    it('returns the parsed body as data', function () {
      assert.truthy(data);
      assert.equal('GET', data.method);
    });

    it('includes the response object', function () {
      assert.truthy(response);
      assert.equal(200, response.statusCode);
    });

    it('includes the parsed body on 404s', function (done) {
      fetch('/json/404', options, function (notFoundError, body) {
        assert.truthy(notFoundError);
        assert.truthy(body);
        assert.equal('/json/404', body.url);
        assert.deepEqual(notFoundError.body, body);
        done();
      });
    });
  });
});