'use strict';

var Collection = require('../../scripts/collection');

describe('collection', function () {

  it('should add and remove', function () {
    var collection = new Collection();

    collection.empty().should.eql(true);

    // Add
    var sing = {
      thing: 'sing'
    };
    collection.add(sing);
    collection.add(sing); // adding again to make sure collection doesn't create a duplicate

    var play = {
      thing: 'play'
    };
    collection.add(play);

    var write = {
      thing: 'write'
    };
    var writeId = collection.add(write);

    // Remove
    collection.remove(writeId);

    // Each
    var items = {};
    collection.each(function (item) {
      items[item.thing] = item;
    });
    items.should.eql({
      'sing': sing,
      'play': play
    });
  });

});
