'use strict';

var getRandomValues = require('../../scripts/get-random-values');

describe('get-random-values', function () {

  it('should get random values', function () {
    // Uint8Array is not supported in IE 9
    // var array = new Uint8Array(10);
    var array = [0, 0, 0];
    getRandomValues(array);

    for (var i = 0; i < array.length; i++) {
      (array[i] === 0).should.eql(false);
    }
  });

});
