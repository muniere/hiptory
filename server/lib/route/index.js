'use strict';

module.exports = function() {
  var ctx = this;

  ctx.install(require('./route.prev'));
  ctx.install(require('./route.api'));
  ctx.install(require('./route.web'));
  ctx.install(require('./route.post'));
};

