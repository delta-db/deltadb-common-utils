'use strict';

var testUtils = require('../../scripts/test-utils'),
  NeverError = require('../../scripts/never-error'),
  Promise = require('bluebird');

describe('test-utils', function () {

  it('should never with no message', function () {
    var err = null;
    try {
      testUtils.never();
    } catch (_err) {
      err = _err;
    }
    (err instanceof NeverError).should.eql(true);
  });

  it('error should equal', function () {
    return testUtils.shouldNonPromiseThrow(function () {
      return testUtils._errShouldEql(null, new NeverError());
    });
  });

  it('should ignore error message', function () {
    var err1 = new Error(),
      err2 = new Error('my error');
    return testUtils._errShouldEql(err1, err2);
  });

  it('should report error when promise does not throw', function () {
    var err = null;
    return testUtils.shouldThrow(function () {
      return Promise.resolve();
    }).catch(function (_err) {
      err = _err;
    }).then(function () {
      (err === null).should.eql(false);
    });
  });

  it('should report error when non-promise does not throw', function () {
    var err = null;
    try {
      testUtils.shouldNonPromiseThrow(function () {});
    } catch (_err) {
      err = _err;
    }
    (err === null).should.eql(false);
  });

});
