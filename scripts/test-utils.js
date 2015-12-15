'use strict';

var NeverError = require('./errors/never-error'),
  utils = require('./utils');

var Utils = function () {};

// Time in milliseconds to wait for test to emit the target event. 100 ms appears to be too short on
// Chrome for most of our tests
Utils.prototype.WAIT_MS = 200;

Utils.prototype.never = function (msg) {
  throw new NeverError(typeof msg === 'undefined' ? 'must never execute' : msg);
};

Utils.prototype._errShouldEql = function (expErr, actErr) {
  if (actErr instanceof NeverError) {
    throw new Error("didn't throw err");
  }

  if (expErr) {
    if (expErr.message) {
      expErr.message.should.eql(actErr.message);
    }

    expErr.name.should.eql(actErr.name);
  } else {
    (actErr === null).should.eql(false);
  }
};

// If err.message is falsy then only ensures that both errors are of the same type
Utils.prototype.shouldThrow = function (fun, err) {
  var self = this;
  return fun().then(function () {
    self.never();
  }).catch(function (_err) {
    self._errShouldEql(err, _err);
  });
};

Utils.prototype.shouldNonPromiseThrow = function (fun, err) {
  try {
    fun();
    this.never();
  } catch (_err) {
    this._errShouldEql(err, _err);
  }
};

Utils.prototype.shouldDoAndOnce = function (promiseFactory, emitter, evnt) {
  var self = this,
    err = true;

  return new Promise(function (resolve) {

    var doOncePromise = utils.doAndOnce(promiseFactory, emitter, evnt).then(function (args) {
      err = false;

      // We've received the event so resolve now instead of waiting for the timeout
      resolve(args);
    });

    utils.timeout(self.WAIT_MS).then(function () {
      if (err) {
        self.never('should have emitted event ' + evnt);
      }
    });

  });
};

// Execute promise and wait to make sure that event is not emitted
Utils.prototype.shouldDoAndNotOnce = function (promiseFactory, emitter, evnt) {
  var self = this,
    err = false;

  utils.doAndOnce(promiseFactory, emitter, evnt).then(function () {
    err = true;
  });

  return utils.timeout(self.WAIT_MS).then(function () {
    if (err) {
      self.never('should not have emitted event ' + evnt);
    }
  });
};

module.exports = new Utils();
