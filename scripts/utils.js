'use strict';

var uuid = require('node-uuid'),
  Promise = require('bluebird'),
  // bcrypt = require('bcrypt'); // TODO: use for server as faster?
  bcrypt = require('bcryptjs');

// NOTE: IE 9/10 doesn't support crypto.getRandomValues so we use isaac to polyfill
var isaac = require('isaac');
/* istanbul ignore next */
if (!global.crypto || (global.window && !window.crypto)) {
  bcrypt.setRandomFallback(function (len) {
    var values = [];
    for (var i = 0; i < len; i++) {
      values[i] = isaac.rand();
    }
    return values;
  });
}

var Utils = function () {
  this._bcrypt = bcrypt; // only for unit testing
};

Utils.prototype._fixDates = function (orig, copy) {
  var self = this;
  self.each(copy, function (value, name) {
    if (orig[name] instanceof Date) { // Date?
      copy[name] = new Date(copy[name]); // convert to Date
    } else if (Array.isArray(value) || typeof value === 'object') {
      // If the value is an Array or object then recursively fix
      self._fixDates(orig[name], copy[name]);
    }
  });
};

/**
 * Clones data and also preserves Dates
 */
Utils.prototype.clone = function (obj) {
  var copy = JSON.parse(JSON.stringify(obj));
  this._fixDates(obj, copy);
  return copy;
};

// callback = function (item, key, obj)
// Note: if callback returns false then the loop will stop
Utils.prototype.each = function (obj, callback) {
  for (var i in obj) {
    /* istanbul ignore next */
    if (obj.hasOwnProperty(i)) {
      if (callback(obj[i], i, obj) === false) {
        break;
      }
    }
  }
};

Utils.prototype.keys = function (obj) {
  var keys = [];
  this.each(obj, function (value, key) {
    keys.push(key);
  });
  return keys;
};

Utils.prototype.empty = function (obj) {
  var empty = true;
  this.each(obj, function () {
    empty = false;
    return false; // stop loop
  });
  return empty;
};

Utils.prototype.uuid = function () {
  return uuid.v4();
};

Utils.prototype.resolveFactory = function (data) {
  return function () {
    return Promise.resolve(data);
  };
};

Utils.prototype.promiseError = function (err) {
  return new Promise(function () {
    throw err;
  });
};

Utils.prototype.promiseErrorFactory = function (err) {
  var self = this;
  return function () {
    return self.promiseError(err);
  };
};

Utils.prototype.merge = function (obj1, obj2) {
  var merged = {},
    i;
  if (obj1) {
    for (i in obj1) {
      merged[i] = obj1[i];
    }
  }
  if (obj2) {
    for (i in obj2) {
      merged[i] = obj2[i];
    }
  }
  return merged;
};

Utils.prototype.hash = function (password, salt) {
  var self = this;
  return new Promise(function (resolve, reject) {
    self._bcrypt.hash(password, salt, function (err, hash) {
      if (err) {
        reject(err);
      }
      resolve(hash);
    });
  });
};

Utils.prototype.genSalt = function () {
  var self = this;
  return new Promise(function (resolve, reject) {
    self._bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        reject(err);
      }
      resolve(salt);
    });
  });
};

Utils.prototype.hashPassword = function (password, salt) {
  return this.hash(password, salt).then(function (hash) {
    return {
      salt: salt,
      hash: hash
    };
  });
};

Utils.prototype.genSaltAndHashPassword = function (password) {
  var self = this;
  return self.genSalt(10).then(function (salt) {
    return self.hashPassword(password, salt);
  });
};

Utils.prototype.notDefined = function (val) {
  return typeof val === 'undefined';
};

Utils.prototype.isDefined = function (val) {
  return typeof val !== 'undefined';
};

Utils.prototype.timeout = function (ms) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, ms);
  });
};

// Executes promise and then resolves after event emitted once
Utils.prototype.doAndOnce = function (promise, emitter, evnt) {
  var once = this.once(emitter, evnt);
  return promise().then(function () {
    return once;
  });
};

Utils.prototype.once = function (emitter, evnt) {
  return new Promise(function (resolve) {
    emitter.once(evnt, function () {
      resolve(arguments);
    });
  });
};

Utils.prototype.sort = function (items, attrs) {
  items.sort(function (a, b) {
    var ret = 0;
    attrs.forEach(function (attr) {
      if (ret === 0) {
        if (!a[attr] && !b[attr]) {
          ret = 0;
        } else if (!a[attr] && b[attr]) {
          ret = 1;
        } else if (a[attr] && !b[attr]) {
          ret = -1;
        } else if (a[attr] < b[attr]) {
          ret = -1;
        } else if (a[attr] > b[attr]) {
          ret = 1;
        }
      }
    });
    return ret;
  });
  return items;
};

Utils.prototype.toArgsArray = function (argsObj) {
  return Array.prototype.slice.call(argsObj);
};

// Include our own implementation of promisify so that we can move away from bluebird once Promises
// become a standard
Utils.prototype.promisify = function (fn, thisArg) {
  var self = this;
  return function () {
    var argsArray = self.toArgsArray(arguments);
    return new Promise(function (resolve, reject) {

      // Define a callback and add it to the arguments
      var callback = function (err) {
        if (err) {
          reject(err);
        } else if (arguments.length === 2) { // single param?
          resolve(arguments[1]);
        } else { // multiple params?
          var cbArgsArray = self.toArgsArray(arguments);
          resolve(cbArgsArray.slice(1)); // remove err arg
        }
      };

      argsArray.push(callback);
      fn.apply(thisArg, argsArray);
    });
  };
};

Utils.prototype.errorInstanceOf = function (err, name) {
  // NOTE: we analyze the error name instead of using instanceof as our errors may be located in
  // different repos and therefore, we may have different versions of these errors, which will lead
  // to instanceof tests failing.
  //
  return err.name === name;
};

module.exports = new Utils();
