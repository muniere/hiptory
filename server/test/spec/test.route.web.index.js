'use strict';

var request = require('supertest');

var ctx = require('../../../');

describe('GET /', function() {

  before(function(done) {
    ctx.start().then(done);
  });

  it('should respond with status 200', function(done) {
    request(ctx.app)
      .get('/')
      .expect(200)
      .end(done);
  });
});
