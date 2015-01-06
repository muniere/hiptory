'use strict';

module.exports = function() {
  var ctx = this;

  var transports = {
    console: {
      type: 'console',
      level: 'error',
      colorize: true,
      timestamp: true
    }
  };

  ctx.child('logger')
    .set({
      general: {
        level: 'info',
        transports: [ transports.console ]
      },
      error: {
        level: 'error',
        transports: [ transports.console ]
      }
    });
};
