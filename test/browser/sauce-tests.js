#!/usr/bin/env node

'use strict';

var Promise = require('bluebird'),
  spawn = require('child_process').spawn;

var clients = [
  // 'firefox',
  // 'chrome',
  'internet explorer',
  'microsoftedge',
  'safari'
];

var run = function (client) {

  return new Promise(function (resolve, reject) {

    var cmd = './test/browser/test.js';

    // Add client env var
    process.env.CLIENT = 'saucelabs:' + client;

    var options = {
      env: process.env
    };

    // console.log(cmd, options);
    console.log('CLIENT=' + process.env.CLIENT, cmd);

    var child = spawn(cmd, options);

    child.stdout.on('data', function (data) {
      console.log(data.toString()); // echo output, including what could be errors
    });

    child.stderr.on('data', function (data) {
      console.error(data.toString());
    });

    child.on('error', function (err) {
      reject(err);
    });

    child.on('exit', function (code) {
      console.log('Process exited with code ' + code + "\n\n");
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(code));
      }
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
  console.log('Fatal Error: ', err);
  process.exit(1); // failure
});
