'use strict';

module.exports = function() {
  var ctx = this;

  var transports = {
    general: {
      type: 'dailyRotateFile',
      level: 'info',
      filename: '/var/log/hiptory/general.log',
      datePattern: 'yyyy-MM-dd',
      colorize: false,
      timestamp: true
    },
    error: {
      type: 'dailyRotateFile',
      level: 'error',
      filename: '/var/log/hiptory/error.log',
      datePattern: 'yyyy-MM-dd',
      colorize: false,
      timestamp: true
    }
  };

  ctx.child('logger')
    .set({
      general: {
        level: 'info',
        transports: [ transports.general ]
      },
      error: {
        level: 'error',
        transports: [ transports.error ]
      }
    });
};
