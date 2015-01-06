'use strict';

module.exports = function() {
  var ctx = this;
  var root = ctx.root();

  ctx.child('database')
    .set({
      scheme: 'hiptory',
      username: null,
      password: null,
      options: {
        dialect: 'mysql',
        host: 'localhost',
        port: 3306,
        logging: function(message) {
          // use root context to avoid reference to ctx.config.logger
          root.logger.general.info(message);
        }
      }
    });
};
