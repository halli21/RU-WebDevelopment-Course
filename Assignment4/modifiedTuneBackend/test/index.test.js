//Importing the application to test
let server = require('../index');

//These are the actual modules we use
let chai = require('chai');
let should = chai.should();
let chaiHttp = require('chai-http');
chai.use(chaiHttp);

let apiUrl = "http://localhost:3000";

describe('Endpoint tests', () => {
    //###########################
    //The beforeEach function makes sure that before each test, 
    //there are exactly two tunes and two genres.
    //###########################
    beforeEach((done) => {
        server.resetState();
        done();
    });

    //###########################
    //Write your tests below here
    //###########################

//3.1
    it("GET /api/v1/tunes - Success Case", function (done) {
        chai.request(apiUrl)
            .get('/api/v1/tunes')
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.be.eql(2);
                done();
            });
    });

    it("GET /api/v1/genres/:genreId/tunes/:tuneId - Success Case", function (done) {
        chai.request(apiUrl)
            .get('/api/v1/genres/0/tunes/3')
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('content');
                res.body.content.should.be.a('array');
                res.body.content.length.should.be.eql(7);
                res.body.should.have.property('id').eql('3');
                res.body.should.have.property('name').eql('Seven Nation Army');
                res.body.should.have.property('genreId').eql('0');
                done();
            });
    });

    it("PATCH /api/v1/genres/:genreId/tunes/:tuneId - Succes Case", function (done) {
        chai.request(apiUrl)
            .patch('/api/v1/genres/1/tunes/0')
            .send({'name': 'Halliluja', 'genreId': "0", 'content': [{"note": "C4", "duration": "8n", "timing": 1}]})
            .end(function(err, res){
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('name').eql('Halliluja');
                res.body.should.have.property('genreId').eql('0');
                res.body.should.have.property('content').eql([{"note": "C4", "duration": "8n", "timing": 1}]);
                done();
            });
    });


//Error cases
    it("PATCH /api/v1/genres/:genreId/tunes/:tuneId - Error Case (incorrect genre id)", function (done) {
        chai.request(apiUrl)
            .patch('/api/v1/genres/0/tunes/0')
            .send({'name': 'Halliluja', 'genreId': "0", 'content': [{"note": "C4", "duration": "8n", "timing": 1}]})
            .end(function(err, res){
                res.should.have.status(400);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('Tune with id 0 does not have genre id 0.');
                done();
            });
    });

    it("PATCH /api/v1/genres/:genreId/tunes/:tuneId - Error Case (invalid non-empty request body)", function (done) {
        chai.request(apiUrl)
            .patch('/api/v1/genres/1/tunes/0')
            .send({'name': 100, 'genreId': "Non-empty", 'content': "Non-empty"})
            .end(function(err, res){
                res.should.have.status(404);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('Genre with id Non-empty does not exist.');
                done();
            });
    });
    
    it("GET /api/v1/genres/:genreId/tunes/:tuneId - Error Case (tune id does not exist)", function (done) {
        chai.request(apiUrl)
            .get('/api/v1/genres/1/tunes/100' )
            .end((err, res) => {
                res.should.have.status(404);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('Tune with id 100 does not exist.');
                done();
            });
    });


//3.2
    it("POST /api/v1/genres/:genreId/tunes - Internal server error", function (done) {
        let newTune = {name: 'test'}

        chai.request(apiUrl)
            .post('/api/v1/genres/1/tunes')
            .set('Content-type', 'application/json')
            .send(newTune)
            .end(function(err, res){
                res.should.have.status(500);
                done();
            });
    });

//3.3
    it("POST /api/v1/genres - Replay attack", function (done) {
        chai.request(apiUrl)
            .post('/api/v1/genres')
            .set('Authorization', 'HMAC f1a71952d1c9d661edf9fe8825ee711b6dc07408903de1e763a58baa0eda82fc')
            .send({'genreName': 'Psychedelic Rock'})
            .end(function(err, res){
                res.should.have.status(201);
                done();
            });
    });


    // Do something weird
    it("GET /randomURL causes 405", function (done) {
        chai.request(apiUrl)
            .get('/randomURL')
            .end((err, res) => {
                res.should.have.status(405);
                done();
            });
    });
});
