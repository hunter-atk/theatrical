process.env.PORT = 8888;
process.env.NODE_ENV = 'test';
const server = require('../server');
const request = require('supertest')(server);
const expect = require('chai').expect;

const knexConfig = require('../knexfile')['test'];
const knex = require('knex')(knexConfig);
const bcryptSync = require('bcrypt');

describe('Tests for users routes', () => {
    before((done) => {
        knex.migrate.rollback().then(() => {
            knex.migrate.latest().then(() => {
                return knex.seed.run()
                    .then(() => done())
                    .catch((err) => done(err));
            });
        });
    });

    it('GET /users should return a list of users', (done) => {
        request.get('/users')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                expect(res.text).to.include('Hegedus');
                done(err);
            });
    });

    it('POST /users should create a new entry in the database', function (done) {
        request.post('/users')
            .send({ first_name: 'Charlie', last_name: 'Stites', phone: '555-555-555', email: 'charlie@someemail.nope', password: bcryptSync.hashSync('charlie', 10), role_id: 2 })
            .expect(201)
            .end(function (err, res) {
                if (err) throw err;
                knex('users')
                    .where({
                        email: 'charlie@someemail.nope'
                    })
                    .first()
                    .then((user) => {
                        expect(user.last_name).to.equal('Stites');
                        expect(bcryptSync.compareSync('charlie', user.password)).to.equal(true);
                        done();
                    });
            });
    });

    it('GET /users/:id should return info about a user', (done) => {
        request.get('/users/3')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                expect(res.text).to.include('Chris');
                expect(res.body.user.phone).to.equal('512-850-6232');
                expect(res.body.user.email).to.equal('cdcasey@gmail.com');
                done(err);
            });
    });

});
