#!/usr/bin/env node

'use strict';

var Promise = require('bluebird'),
  spawn = require('child_process').spawn;

var clients = [
  'firefox',
  'chrome',
  'internet explorer',
  'microsoftedge',
  'safari'
];

var run = function (client) {

  return new Promise(function (resolve, reject) {

    var cmd = './test/browser/test.js';

    var options = {
      env: {
        CLIENT: 'saucelabs:' + client,
        SAUCE_USERNAME: process.env.SAUCE_USERNAME,
        SAUCE_ACCESS_KEY: process.env.SAUCE_ACCESS_KEY
      }
    };

    console.log(cmd, options);

    var child = spawn(cmd, options);

    child.stdout.on('data', function (data) {
      console.log(data.toString()); // echo output, including what could be errors
    });

    child.on('close', function (code) {
      console.log('Mocha process exited with code ' + code + "\n\n");
      if (code > 0) {
        reject(new Error(code));
      } else {
        resolve(code);
      }
    });

    child.on('error', function (err) {
      reject(err);
    });

  });

};

// We need to sequentially chain the processes as saucelabs limits the amount of concurrent
// connections
var chain = Promise.resolve();

clients.forEach(function (client) {
  chain = chain.then(function () {
    return run(client);
  });
});

chain.then(function () {
  process.exit(0); // success
}).catch(function (err) {
  console.log(err);
  process.exit(1); // failure
});
