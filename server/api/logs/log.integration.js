'use strict';

var app = require('../..');
import request from 'supertest';

describe('Logs API:', function() {

  describe('GET /api/log', function() {

    var logs;
    beforeEach(function(done) {
      request(app)
        .get('/api/log')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          logs = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(logs).to.be.instanceOf(Array)
    });

  });

});
