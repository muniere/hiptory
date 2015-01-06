'use strict';

var path = require('path');

module.exports = function() {
  var ctx = this;
  var root = ctx.root();

  ctx.child('database')
    .set({
      scheme: null,
      username: null,
      password: null,
      options: {
        dialect: 'sqlite',
        storage: path.join(process.env.HOME, '.hiptory/hiptory.db'),
        logging: function(message) {
          // use root context to avoid reference to ctx.config.logger
          root.logger.general.debug(message);
        }
      }
    });
};
