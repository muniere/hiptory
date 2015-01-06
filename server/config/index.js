'use strict';

module.exports = function() {
  var ctx = this;

  ctx.child('config')
    .install(require('./shared'))
    .install(require('./' + process.env.NODE_ENV));
};
