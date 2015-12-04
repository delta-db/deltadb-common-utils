'use strict';

var DBExistsError = require('../../../scripts/errors/db-exists-error');

describe('db-exists-error', function () {

  it('shoud create', function () {
    var err = new DBExistsError('my err');
    err.name.should.eql('DBExistsError');
  });

});
