'use strict';

var _ = require('lodash');
var sinon = require('sinon');
var request = require('supertest');
var Promise = require('bluebird');

var ctx = require('../../../').setOption('useSetter', true);

describe('GET /auth', function() {

  before(function(done) {
    ctx.start().then(done);
  });

  it('should respond with status 200', function(done) {
    request(ctx.app)
      .get('/auth')
      .expect(200)
      .end(done);
  });
});

describe('POST /auth', function() {

  before(function(done) {
    ctx.start().then(done);
  });

  describe('with valid token', function() {

    it('should respond with status 302', function(done) {

      var session = _.first(_.values(require('../fixture/fixture.hipchat.session')));

      sinon.stub(ctx.logic.auth, 'execute', function() {
        var user = ctx.model.User.build({
          id: session.owner.id,
          name: session.owner.name,
          token: session.access_token
        });
        var created = true;

        return Promise.resolve([user, created]);
      });

      request(ctx.app)
        .post('/api/auth.json')
        .send({ token: session.access_token })
        .expect(200)
        .end(function(err) {
          ctx.logic.auth.execute.restore();

          return done(err);
        });
    });
  });

  describe('with invalid token', function() {

    it('should respond with status 401', function(done) {

      sinon.stub(ctx.logic.auth, 'execute', function() {
        var e = new Error('Invalid OAuth session');
        e.type = 'Unauthorized';
        e.code = e.status = 401;

        return Promise.reject(e);
      });

      request(ctx.app)
        .post('/api/auth.json')
        .send({ token: 'ThisIsAnInvalidToken' })
        .expect(401)
        .end(function(err) {
          ctx.logic.auth.execute.restore();

          return done(err);
        });
    });
  });
});
