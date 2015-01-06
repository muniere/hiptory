'use strict';

var _ = require('lodash');

module.exports = function() {
  var ctx = this;

  var privates = {

    /**
     * Reject access.
     */
    reject: function(req, res) {
      req.session = null;
      res.clearCookie('ticket');

      if (req.xhr) {
        return res.status(401).json(req.ctx.error);
      } else {
        return res.redirect('/auth');
      }
    }
  };
  ctx.set({ auth: function() {
    return function(req, res, next) {

      if (/(js|css|woff|ttf)$/.test(req.path)) {
        return next();
      }

      if (/\/auth$/.test(req.path) &&
          _.contains(['GET', 'HEAD'], req.method.toUpperCase())) {
        return next();
      }
      if (/\/auth\.json$/.test(req.path) &&
          _.contains(['POST', 'PUT', 'DELETE'], req.method.toUpperCase())) {
        return next();
      }

      if (!req.session || !req.session.token) {
        req.ctx.set({ error: new Error('token not found')});
        ctx.logger.general.warn(req.ctx.error.message);
        return privates.reject(req, res);
      }

      if (!req.cookies.ticket) {
        req.ctx.set({ error: new Error('ticket not found')});
        ctx.logger.general.warn(req.ctx.error.message);
        return privates.reject(req, res);
      }

      var parsed = ctx.logic.auth.parseTicket(req.cookies.ticket);

      if (parsed.token !== req.session.token) {
        req.ctx.set({ error: new Error('ticket not matched')});
        ctx.logger.general.warn(req.ctx.error.message);
        return privates.reject(req, res);
      }

      if (parsed.expire < Date.now()) {
        req.ctx.set({ error: new Error('token expired')});
        ctx.logger.general.warn(req.ctx.error.message);
        return privates.reject(req, res);
      }

      ctx.model.User.findOne({ where: { token: req.session.token } })
        .then(function(user) {
          if (!user) {
            req.ctx.set({ error: new Error('user not found')});
            ctx.logger.general.warn(req.ctx.error.message);
            return privates.reject(req, res);
          }

          return next();
        });
    };
  }});
};
