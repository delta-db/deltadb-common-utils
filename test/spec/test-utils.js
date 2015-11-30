'use strict';

var testUtils = require('../../scripts/test-utils'),
  NeverError = require('../../scripts/never-error'),
  Promise = require('bluebird'),
  EventEmitter = require('events').EventEmitter;

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

  it('should do and once', function () {
    var emitter = new EventEmitter();

    // Nothing should be thrown as event is emitted
    return testUtils.shouldDoAndOnce(function () {
      emitter.emit('ping');
      return Promise.resolve();
    }, emitter, 'ping');
  });

  it('should do and once should report missing event', function () {
    var emitter = new EventEmitter();

    // No event is emitted so an error is thrown
    return testUtils.shouldThrow(function () {
      return testUtils.shouldDoAndOnce(function () {
        return Promise.resolve();
      }, emitter, 'ping').catch(function (err) {
        // "Convert" to regular error as NeverError is handled differently
        throw new Error(err.message);
      });
    });
  });

  it('should do and not once', function () {
    var emitter = new EventEmitter();

    // Nothing should be thrown as event is not emitted
    return testUtils.shouldDoAndNotOnce(function () {
      return Promise.resolve();
    }, emitter, 'ping');
  });

  it('should do and not once should report event', function () {
    var emitter = new EventEmitter();

    // Event is emitted so an error is thrown
    return testUtils.shouldThrow(function () {
      return testUtils.shouldDoAndNotOnce(function () {
        emitter.emit('ping');
        return Promise.resolve();
      }, emitter, 'ping').catch(function (err) {
        // "Convert" to regular error as NeverError is handled differently
        throw new Error(err.message);
      });
    });
  });

});
