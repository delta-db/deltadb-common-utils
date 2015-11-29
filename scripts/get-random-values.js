'use strict';

// NOTE: IE 9/10 doesn't support crypto.getRandomValues so we use isaac to polyfill

var isaac = require('isaac');

isaac.seed((new Date()).getTime() * Math.random()); // random seed

function getRandomValues(bytes) {
  for (var i = 0; i < bytes.length; i++) {
    bytes[i] = isaac.rand();
  }
}

module.exports = getRandomValues;
