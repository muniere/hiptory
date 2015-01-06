'use strict';

var request = require('supertest');

var ctx = require('../../../');

describe('GET /api/alive.json', function() {

  before(function(done) {
    ctx.start().then(done);
  });

  it('should respond with status 200', function(done) {
    request(ctx.app)
      .get('/api/alive.json')
      .expect(200)
      .end(done);
  });
});
