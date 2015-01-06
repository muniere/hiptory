'use strict';

/*
 * libraries
 */
var ctx = require('behalter');
var http = require('http');
var express = require('express');
var Promise = require('bluebird');
var Sequelize = require('sequelize');

/*
 * environment
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'standalone';
process.env.PORT = process.env.PORT || 3000;

/*
 * config
 */
ctx.install(require('./config'));

/*
 * components
 */
ctx.set('sequelize', new Sequelize(
  ctx.config.database.scheme,
  ctx.config.database.username,
  ctx.config.database.password,
  ctx.config.database.options
));
ctx.install(require('./lib/logger'));
ctx.install(require('./lib/bridge'));
ctx.install(require('./lib/model'));
ctx.install(require('./lib/logic'));
ctx.install(require('./lib/middle'));

/*
 * routing
 */
ctx.set('app', express());
ctx.install(require('./lib/controller'));
ctx.install(require('./lib/route'));

/**
 * public api
 */
var started = false;
ctx.set({

  /**
   * Create server(if not exists) and start to listen port
   *
   * @return {Promise}
   */
  start: function() {

    if (started) {
      return Promise.resolve();
    }

    return new Promise(function(resolve) {
      if (!ctx.server) {
        ctx.set('server', http.createServer(ctx.app));
      }

      ctx.server.listen(ctx.config.port, function() {
        started = true;
        return resolve();
      });
    });
  },

  /**
   * Get started status
   *
   * @return {boolean}
   */
  started: function() {
    return started;
  },

  /**
   * Server stop to listen port
   *
   * @return {Promise}
   */
  stop: function() {

    if (!started) {
      return Promise.resolve();
    }

    return new Promise(function(resolve) {
      if (!ctx.server) {
        throw new Error('server not created');
      }

      ctx.server.close(function() {
        started = false;
        return resolve();
      });
    });
  },

  /**
   * Get sopped status
   *
   * @return {boolean}
   */
  stopped: function() {
    return !started;
  },

  /**
   * Synchronize database
   *
   * @return {Promise}
   */
  sync: function() {
    return ctx.sequelize.sync();
  },

  /**
   * Drop database
   *
   * @return {Promsie}
   */
  drop: function() {
    return ctx.sequelize.drop();
  }
});

if (!module.parent) {
  ctx.start();
}

module.exports = ctx;
