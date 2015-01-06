'use strict';

var path = require('path');

module.exports = function() {
  var ctx = this;

  ctx.child('path')
    .set({
      server: path.normalize(path.join(__dirname, '/../../../server')),
      client: path.normalize(path.join(__dirname, '/../../../client'))
    });
};
