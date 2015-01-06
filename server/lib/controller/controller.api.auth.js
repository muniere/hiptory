'use strict';

module.exports = function() {
  var ctx = this;

  ctx.child('api').child('auth')
    .set({

      /**
       * Show auth information.
       */
      show: function(req, res) {

        return res.status(200).json({
          token: req.session.token,
          ticket: req.cookies.ticket
        });
      },

      /**
       * Execute authentication and save cookie.
       */
      create: function(req, res, next) {

        if (!req.body.token) {
          return res.status(400).json(false);
        }

        ctx.logic.auth.execute({ token: req.body.token })
          .spread(function(user, created) {
            if (created) {
              ctx.logger.general.info('saved a new user : ', user.id);
            } else {
              ctx.logger.general.debug('user already saved: ', user.id);
            }

            req.session.token = user.token;
            res.cookie('ticket', ctx.logic.auth.createTicket(user.token), {
              maxAge: ctx.config.session.maxAge
            });

            return res.status(200).json(true);
          })
          .catch(function(err) {
            return next(err);
          });
      },

      /**
       * Remove authentication cookie.
       */
      remove: function(req, res) {

        req.session = null;
        res.clearCookie('ticket');

        return res.status(200).json(true);
      }
    });
};
