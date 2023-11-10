import { expect } from 'chai';
import request from 'supertest';
import { app } from '../../src/index';
import { describe } from 'mocha';

describe('USER TEST CASES', () => {
  it('should get all the users in db', (done) => {
    request(app)
      .get('/api/users')
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        const { data } = res.body;
        expect(res.status).to.be.equal(200);
        expect(data.data.rows).to.be.an('array');
        expect(data.data.rows).to.have.lengthOf(1);

        return done();
      });
  });
});
