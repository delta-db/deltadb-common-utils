'use strict';

var getRandomValues = require('../../scripts/get-random-values');

describe('get-random-values', function () {

  it('should get random values', function () {
    var array = new Uint8Array(10);
    getRandomValues(array);

    for (var i = 0; i < array.length; i++) {
      (array[i] === 0).should.eql(false);
    }
  });

});
