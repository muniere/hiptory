'use strict';

module.exports = function() {
  var ctx = this;

  ctx.child('session')
    .set({
      name: 'sid',
      secret: 'horpity',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
};
