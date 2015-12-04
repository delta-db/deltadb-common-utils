'use strict';

var DBMissingError = require('../../../scripts/errors/db-missing-error');

describe('db-missing-error', function () {

  it('shoud create', function () {
    var err = new DBMissingError('my err');
    err.name.should.eql('DBMissingError');
  });

});
