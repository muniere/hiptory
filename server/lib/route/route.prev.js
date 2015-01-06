'use strict';

var _ = require('lodash');
var ECT = require('ect');
var path = require('path');
var morgan = require('morgan');
var minify = require('html-minifier').minify;
var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var methodOverride = require('method-override');

module.exports = function() {
  var ctx = this;

  // view
  var ect = new ECT({
    root: path.join(ctx.config.path.server, '/view'),
    watch: true,
    ext: '.ect'
  });
  ctx.app.set('view engine', 'ect');
  ctx.app.set('views', path.join(ctx.config.path.server, '/view'));
  ctx.app.engine('ect', function(template, data, callback) {
    ect.render(template, data, function(err, html) {
      callback(err, minify(html, {
        minifyJS: true,
        removeComments: true,
        collapseWhitespace: true
      }));
    });
  });

  // standard
  ctx.app.use(compression());
  ctx.app.use(bodyParser.urlencoded({ extended: false }));
  ctx.app.use(bodyParser.json());
  ctx.app.use(methodOverride(function(req) {
    if (!req.body || !req.body._method) {
      return undefined;
    }
    var method = req.body._method;
    delete req.body._method;
    return method;
  }));
  ctx.app.use(cookieParser());

  // static
  var stat = {
    standalone: path.join(ctx.config.path.client, 'dev'),
    development: path.join(ctx.config.path.client, 'dev'),
    production: path.join(ctx.config.path.client, 'prd')
  }[ctx.config.env];

  if (stat) {
    ctx.app.use('/public', express.static(stat));
  }

  // session
  ctx.app.use(cookieSession(ctx.config.session.__values));

  // locals
  ctx.app.use(function(req, res, next) {
    _.merge(res.locals, {
      isDev: _.contains(['standalone', 'development'], ctx.config.env),
      isPrd: _.contains(['production'], ctx.config.env)
    });
    return next();
  });

  // context
  ctx.app.use(ctx.middle.context());

  // log
  if (_.contains(['standalone', 'development', 'production'], ctx.config.env)) {
    ctx.app.use(morgan('dev'));
  }

  // auth
  if (_.contains(['standalone', 'development', 'production'], ctx.config.env)) {
    ctx.app.use(ctx.middle.auth());
  }
};
