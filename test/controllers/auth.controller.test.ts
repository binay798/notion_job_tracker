import { expect } from 'chai';
import request from 'supertest';
import { bookshelf } from '../../src/db';
import { app } from '../../src/index';
import logger from '../../src/utils/logger';
import { describe } from 'mocha';

describe('AUTHENTICATION TEST CASES', () => {
  describe('SIGNUP FUNCTIONALITY', () => {
    before((done) => {
      bookshelf.knex
        .raw('TRUNCATE TABLE users RESTART IDENTITY CASCADE;')
        .then(() => done())
        .catch((err) => {
          return done(err);
        });
    });
    it('should create a new user with valid data', (done) => {
      const data = {
        firstname: 'binay',
        lastname: 'shrestha',
        role: 'ADMIN',
        password: '123456',
        email: 'binay@gmail.com',
      };

      request(app)
        .post('/api/auth/signup')
        .send(data)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          const { data } = res.body;
          expect(res.status).to.be.equal(200);
          expect(data.type).to.be.equal('success');
          done();
        });
    });

    it('should not create user with incomplete data', (done) => {
      const data = { firstname: 'bin', lastname: 'shres' };
      request(app)
        .post('/api/auth/signup')
        .send(data)
        .end((err, res) => {
          // const { data } = res.body;
          logger.info(res.status);
          expect(res.status).to.be.equal(400);
          // expect(data.data).to.be.an('array');
          done();
        });
    });

    it('should not created user with duplicate email address', (done) => {
      const data = {
        email: 'binay@gmail.com',
        password: '123456',
        firstname: 'binay',
        lastname: 'shrestha',
        role: 'ADMIN',
      };
      request(app)
        .post('/api/auth/signup')
        .send(data)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.status).to.be.equal(409);
          done();
        });
    });
  });

  describe('LOGIN FUNCTIONALITY', () => {
    it('should log in user', (done) => {
      const data = { email: 'binay@gmail.com', password: '123456' };
      request(app)
        .post('/api/auth/login')
        .send(data)
        .end((err, res) => {
          expect(res.status).to.be.equal(200);
          done();
        });
    });

    it('should not log in user with incorrect email', (done) => {
      const data = { email: 'binay1@gmail.com', password: '123456' };
      request(app)
        .post('/api/auth/login')
        .send(data)
        .end((err, res) => {
          expect(res.status).to.be.equal(409);
          done();
        });
    });
    it('should not log in user with empty password field', (done) => {
      const data = { email: 'binay@gmail.com' };
      request(app)
        .post('/api/auth/login')
        .send(data)
        .end((err, res) => {
          const { data } = res.body;
          expect(res.status).to.be.equal(400);
          expect(data.data).to.be.an('array');
          expect(data.data[0].message).to.be.equal('"password" is required');
          done();
        });
    });
    it('should not log in user with incorrect password', (done) => {
      const data = { email: 'binay@gmail.com', password: '123' };
      request(app)
        .post('/api/auth/login')
        .send(data)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          const { data } = res.body;
          expect(res.status).to.be.equal(406);
          expect(data.message).to.be.equal('Email or password incorrect');
          done();
        });
    });
  });
});
