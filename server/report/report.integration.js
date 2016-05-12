'use strict';

var app = require('..');
import request from 'supertest';

describe('Report API:', function() {

  describe('GET /report', function() {

    beforeEach(function(done) {
      request(app)
        .get('/report')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with JSON array', function() {
    });

  });

});
