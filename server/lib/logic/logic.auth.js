'use strict';

var crypto = require('crypto');

module.exports = function() {
  var ctx = this;

  /*
   * Constant values for auth
   *
   * ENCODING1:
   *  - input encoding for cipher
   *  - output encoding for decipher
   *
   * ENCODING2:
   *  - output encoding for cipher
   *  - input encoding for decipher
   */
  var CONSTS = {
    SEPARATOR: ':',
    ALGORITHM: 'aes256',
    ENCODING1: 'utf8',
    ENCODING2: 'base64',
    PASSWORD: 'hopitry',
    MAX_AGE: 7 * 24 * 60 * 60 * 1000
  };

  ctx.child('auth')
    .set({

      /**
       * Execute authentication with token.
       *
       * @param {Object} args
       * @param {string} args.token
       * @return {Promise}
       */
      execute: function(args) {

        var created;

        return ctx.model.User.findOne({ where: { token: args.token } })
          .then(function(user) {
            if (user) {
              return [user, created=false];
            }

            return ctx.bridge.hipchat.fetchSession({ token: args.token })
              .then(function(session) {
                return ctx.model.User.create({
                  id: session.owner.id,
                  name: session.owner.name,
                  token: session.access_token
                });
              })
              .then(function(user) {
                return [user, created=true];
              });
          });
      },

      /**
       * Create ticket from token.
       *
       * @param {string} token
       * @return {string} ticket
       * @private
       */
      createTicket: function(token) {

        var splitted = [token, Date.now() + CONSTS.MAX_AGE];
        var joined = splitted.join(CONSTS.SEPARATOR);
        var cipher = crypto.createCipher(CONSTS.ALGORITHM, CONSTS.PASSWORD);

        return cipher.update(joined, CONSTS.ENCODING1, CONSTS.ENCODING2) + cipher.final(CONSTS.ENCODING2);
      },

      /**
       * Parse ticket.
       *
       * @param {string} ticket
       * @return {Object} parsed
       * @private
       */
      parseTicket: function(ticket) {

        var decipher = crypto.createDecipher(CONSTS.ALGORITHM, CONSTS.PASSWORD);
        var joined = decipher.update(ticket, CONSTS.ENCODING2, CONSTS.ENCODING1) + decipher.final(CONSTS.ENCODING1);
        var splitted = joined.split(CONSTS.SEPARATOR);

        return {
          token: String(splitted[0]),
          expire: Number(splitted[1])
        };
      }
    });
};
