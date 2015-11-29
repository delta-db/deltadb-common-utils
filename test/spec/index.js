'use strict';

describe('utils', function () {

  // The default of 2s is too low for IE 9
  this.timeout(4000);

  require('./collection');
  require('./dictionary');
  require('./log');
  require('./test-utils');
  require('./utils');

});
