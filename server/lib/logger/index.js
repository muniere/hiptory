'use strict';

var _ = require('lodash');
var winston = require('winston');
var transports = {
  console: winston.transports.Console,
  dailyRotateFile: winston.transports.DailyRotateFile
};

module.exports = function() {
  var ctx = this;
  var logger = ctx.child('logger');

  _.each(ctx.config.logger.__values, function(config, name) {
    // copy config
    var conf = _.merge({ level: 'info', transports: [] }, config);

    // instantiate transports
    conf.transports = _.map(conf.transports, function(c) {
      return new transports[c.type](_.omit(c, 'type'));
    });

    // instantiate logger
    logger.set(name, new winston.Logger(conf));
  });
};

