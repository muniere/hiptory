'use strict';

module.exports = function() {
  var ctx = this;

  var transports = {
    console: {
      type: 'console',
      level: 'debug',
      colorize: true,
      timestamp: true
    }
  };

  ctx.child('logger')
    .set({
      general: {
        level: 'debug',
        transports: [ transports.console ]
      },
      error: {
        level: 'error',
        transports: [ transports.console ]
      }
    });
};
