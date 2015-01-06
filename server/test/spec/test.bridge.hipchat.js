'use strict';

var _ = require('lodash');
var nock = require('nock');
var expect = require('expect.js');
var sprintf = require('sprintf').sprintf;

var ctx = require('../../../');

describe('bridge.hipchat', function() {

  before(function(done) {
    ctx.start().then(done);
  });

  describe('fetchSession', function() {

    it('should return session fetched from api', function(done) {

      nock.disableNetConnect();

      var sessions = require('../fixture/fixture.hipchat.session');
      var tokens = _.keys(sessions);

      var scope = nock('https://api.hipchat.com').filteringPath(/\?auth_token=.*/, '');
      _.each(sessions, function(session, token) {
        scope.get(sprintf('/v2/oauth/token/%s', token)).reply(200, session);
      });

      var token = _.first(tokens);
      var expected = sessions[token];

      ctx.bridge.hipchat.fetchSession({ token: token })
        .then(function(session) {
          expect(session.access_token).to.eql(expected.access_token);
          expect(session.owner.id).to.eql(expected.owner.id);
        })
        .nodeify(done)
        .finally(function() {
          nock.cleanAll();
          nock.enableNetConnect();
        });
    });

    it('should throw error when api return status code 401', function(done) {

      nock.disableNetConnect();

      var sessions = require('../fixture/fixture.hipchat.session');
      var tokens = _.keys(sessions);

      var scope = nock('https://api.hipchat.com').filteringPath(/\?auth_token=.*/, '');
      _.each(tokens, function(token) {
        scope.get(sprintf('/v2/oauth/token/%s', token)).reply(401, {
          error: {
            code: 401,
            type: 'Unauthorized',
            message: 'Invalid OAuth session'
          }
        });
      });

      var token = _.first(tokens);

      ctx.bridge.hipchat.fetchSession({ token: token })
        .then(function() {
          return done(new Error('no errors were thrown'));
        })
        .catch(function(err) {
          expect(err).to.be.ok();
          return done();
        })
        .finally(function() {
          nock.cleanAll();
          nock.enableNetConnect();
        });
    });
  });

  describe('fetchHistory', function() {

    it('should fetch history from the specific room', function(done) {

      nock.disableNetConnect();

      var sessions = require('../fixture/fixture.hipchat.session');
      var histories = require('../fixture/fixture.hipchat.history');

      var scope = nock('https://api.hipchat.com').filteringPath(/\?.*/, '');
      _.each(histories, function(history, roomId) {
        scope.get(sprintf('/v2/room/%s/history', roomId)).reply(200, history);
      });

      var token = _.first(_.keys(sessions));

      var room = ctx.model.Room.build({
        id: _.first(_.keys(histories)),
        name: 'MyRoom',
        privacy: 'private'
      });
      var expected = histories[room.id];

      ctx.bridge.hipchat.fetchHistory({ token: token, room: room, limit: 500 })
        .then(function(history) {
          expect(history).to.be.ok();
          expect(history.items).to.eql(expected.items);
        })
        .nodeify(done)
        .finally(function() {
          nock.cleanAll();
          nock.enableNetConnect();
        });
    });
  });

  describe('fetchLatestHistory', function() {

    it('should fetch latest history from the specific room', function(done) {

      nock.disableNetConnect();

      var sessions = require('../fixture/fixture.hipchat.session');
      var histories = require('../fixture/fixture.hipchat.history.latest');

      var scope = nock('https://api.hipchat.com').filteringPath(/\?.*/, '');
      _.each(histories, function(history, roomId) {
        scope.get(sprintf('/v2/room/%s/history/latest', roomId)).reply(200, history);
      });

      var token = _.first(_.keys(sessions));

      var room = ctx.model.Room.build({
        id: _.first(_.keys(histories)),
        name: 'MyRoom',
        privacy: 'private'
      });
      var expected = histories[room.id];

      ctx.bridge.hipchat.fetchLatestHistory({ token: token, room: room })
        .then(function(history) {
          expect(history).to.be.ok();
          expect(history.items).to.eql(expected.items);
        })
        .nodeify(done)
        .finally(function() {
          nock.cleanAll();
          nock.enableNetConnect();
        });
    });
  });
});
