'use strict';

module.exports = function() {
  var ctx = this;

  ctx.set({
    env: process.env.NODE_ENV,
    port: process.env.PORT
  });
};
