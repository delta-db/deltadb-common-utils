'use strict';

var utils = require('./utils');

// We need an obj to help us determine which data is a value and which is a holder of keys
var Items = function () {};

var NILL = '$$null$$'; // so that we can hash null keys

var Dictionary = function () {
  this._items = new Items();
};

Dictionary.prototype._hash = function (k) {
  return k === null ? NILL : k;
};

Dictionary.prototype._unhash = function (k) {
  return k === NILL ? null : k;
};

Dictionary.prototype._set = function (items, keysAndValue) {
  var k = this._hash(keysAndValue[0]);

  if (keysAndValue.length === 2) { // e.g. _set(items, ['x', 1])
    items[k] = keysAndValue[1];
  } else {
    if (!items[k]) {
      items[k] = new Items();
    }
    keysAndValue.shift(); // remove first value
    this._set(items[k], keysAndValue);
  }
};

Dictionary.prototype.set = function () {
  if (arguments.length <= 2) {
    throw new Error('usage: set(key1, [key2, ... keyN], value)');
  }
  // phantomjs requires us to pass an array and not the original arguments object
  this._set(this._items, utils.toArgsArray(arguments));
};

Dictionary.prototype._get = function (items, keys, unset) {
  var k = this._hash(keys[0]);

  if (!items[k]) {
    throw new Error(k + ' missing');
  }

  if (keys.length === 1) { // e.g. _get(items, ['x'])
    var val = items[k];
    if (unset) {
      delete items[k];
    }
    return val;
  } else {
    keys.shift(); // remove 1st key
    return this._get(items[k], keys, unset);
  }
};

Dictionary.prototype.get = function () {
  // phantomjs requires us to pass an array and not the original arguments object
  return this._get(this._items, utils.toArgsArray(arguments));
};

Dictionary.prototype.exists = function () {
  try {
    // phantomjs requires us to pass an array and not the original arguments object
    this._get(this._items, utils.toArgsArray(arguments));
  } catch (err) {
    return false;
  }
  return true;
};

Dictionary.prototype.unset = function () {
  // phantomjs requires us to pass an array and not the original arguments object
  return this._get(this._items, utils.toArgsArray(arguments), true);
};

Dictionary.prototype._each = function (items, keys, callback) {
  var self = this;
  if (!Items.prototype.isPrototypeOf(items)) { // value?
    callback(items, keys);
  } else {
    utils.each(items, function (item, key) {
      var curKeys = utils.clone(keys);
      curKeys.push(self._unhash(key));
      self._each(item, curKeys, callback);
    });
  }
};

Dictionary.prototype.each = function (callback) {
  return this._each(this._items, [], callback);
};

Dictionary.prototype.empty = function () {
  // TODO: make unset actually clear out entire tree when there are no more leafs to free mem
  var empty = true;
  this.each(function () {
    empty = false;
    return false; // exit loop early
  });
  return empty;
};

module.exports = Dictionary;
