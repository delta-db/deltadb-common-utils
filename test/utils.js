'use strict';

// NOTE: this code is duplicated in deltadb-common-test-utils but we include it here so that there
// is not a circular dependency between common-utils and common-test-utils.

var Utils = function () {};

Utils.prototype.never = function (msg) {
  throw new Error(typeof msg === 'undefined' ? 'must never execute' : msg);
};

Utils.prototype._errShouldEql = function (expErr, actErr) {
  if (actErr.message === 'must never execute') { // TODO: define & use NeverException instead
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

module.exports = new Utils();
