import * as request from 'supertest-as-promised';
import * as httpStatus from 'http-status';
import * as chai from 'chai';
import { expect } from 'chai';
let app = require('../../dist/index').default;

chai.config.includeStack = true;

describe('## Misc', () => {
  describe('# GET /api/health-check', () => {
    it('should return OK', (done) => {
      request(app)
        .get('/api/health-check')
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.text).to.equal('OK');
          done();
        });
    });
  });

  describe('# GET /api/404', () => {
    it('should return 404 status', (done) => {
      request(app)
        .get('/api/404')
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.message).to.equal('Not Found');
          done();
        });
    });
  });

  describe('# Error Handling', () => {
    // Should write a better version of internal server error 

    // it('should handle mongoose CastError - Cast to ObjectId failed', (done) => {
    //   request(app)
    //     .get('/api/users/56z787zzz67fc')
    //     .expect(httpStatus.INTERNAL_SERVER_ERROR)
    //     .then(res => {
    //       expect(res.body.message).to.equal('Internal Server Error');
    //       done();
    //     });
    // });

    it('should handle express validation error - username is required', (done) => {
      request(app)
        .post('/api/users')
        .send({
          "mobileNumber": "1234567890"
        })
        .expect(httpStatus.BAD_REQUEST)
        .then(res => {
          expect(res.body.message).to.equal(`invalid username`);
          done();
        });
    });
  });
});
