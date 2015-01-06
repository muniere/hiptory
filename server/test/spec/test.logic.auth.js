'use strict';

var _ = require('lodash');
var sinon = require('sinon');
var expect = require('expect.js');
var Promise = require('bluebird');

var ctx = require('../../../').setOption('useSetter', true);

describe('logic.auth', function() {

  describe('execute', function() {

    before(function(done) {
      Promise.resolve()
        .then(function() {
          return ctx.sequelize.drop();
        })
        .then(function() {
          return ctx.sequelize.sync();
        })
        .nodeify(done);
    });

    describe('with valid token', function() {

      it('should save user data and return saved user', function(done) {

        var session = _.first(_.values(require('../fixture/fixture.hipchat.session')));

        sinon.stub(ctx.bridge.hipchat, 'fetchSession', function() {
          return Promise.resolve(session);
        });

        ctx.logic.auth.execute({ token: session.auth_token })
          .spread(function(user, created) {
            expect(user).to.be.ok();
            expect(created).to.be.ok();
          })
          .then(function() {
            return ctx.model.User.find({ where: { token: session.access_token } })
              .then(function(user) {
                expect(user).to.be.ok();
                expect(user.token).to.eql(session.access_token);
              });
          })
          .nodeify(done)
          .finally(function() {
            ctx.bridge.hipchat.fetchSession.restore();
          });
      });
    });

    describe('with invalid token', function() {

      it('should throw error with status 401', function(done) {

        sinon.stub(ctx.bridge.hipchat, 'fetchSession', function() {
          var e = new Error('Invalid OAuth session');
          e.type = 'Unauthorized';
          e.code = e.status = 401;

          return Promise.reject(e);
        });

        ctx.logic.auth.execute({ token: 'ThisIsAnInvalidToken' })
          .then(function() {
            return done(new Error('no errors were thrown'));
          })
          .catch(function(err) {
            expect(err).to.be.ok();
            return done();
          })
          .finally(function() {
            ctx.bridge.hipchat.fetchSession.restore();
          });
      });
    });
  });
});
