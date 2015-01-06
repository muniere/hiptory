'use strict';

var errorHandler = require('errorhandler');

module.exports = function() {
  var ctx = this;

  ctx.app.use(errorHandler({
    log: function(err, str) {
      if (err.status >= 500) {
        ctx.logger.error.error(str);
      } else {
        ctx.logger.general.warn(str);
      }
    }
  }));
};
