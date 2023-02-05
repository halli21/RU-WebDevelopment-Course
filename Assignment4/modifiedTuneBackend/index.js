const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const sha256 = require('js-sha256');

const apiPath = '/api/';
const version = 'v1';
let port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());  
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

//Our id counters
//We use basic integer ids here, but other solutions (such as UUIDs) would be better
let nextTuneId = 4;
let nextGenreId = 2;

//The following is an example of an array of two tunes.  Compared to assignment 2, I have shortened the content to make it readable
var tunes = [
    { id: '0', name: "Für Elise", genreId: '1', content: [{note: "E5", duration: "8n", timing: 0},{ note: "D#5", duration: "8n", timing: 0.25},{ note: "E5", duration: "8n", timing: 0.5},{ note: "D#5", duration: "8n", timing: 0.75},
    { note: "E5", duration: "8n", timing: 1}, { note: "B4", duration: "8n", timing: 1.25}, { note: "D5", duration: "8n", timing: 1.5}, { note: "C5", duration: "8n", timing: 1.75},
    { note: "A4", duration: "4n", timing: 2}] },

    { id: '3', name: "Seven Nation Army", genreId: '0', 
    content: [{note: "E5", duration: "4n", timing: 0}, {note: "E5", duration: "8n", timing: 0.5}, {note: "G5", duration: "4n", timing: 0.75}, {note: "E5", duration: "8n", timing: 1.25}, {note: "E5", duration: "8n", timing: 1.75}, {note: "G5", duration: "4n", timing: 1.75}, {note: "F#5", duration: "4n", timing: 2.25}] }
];

let genres = [
    { id: '0', genreName: "Rock"},
    { id: '1', genreName: "Classic"}
];

module.exports.resetState = function () {
    tunes = [
        { id: '0', name: "Für Elise", genreId: '1', content: [{note: "E5", duration: "8n", timing: 0},{ note: "D#5", duration: "8n", timing: 0.25},{ note: "E5", duration: "8n", timing: 0.5},{ note: "D#5", duration: "8n", timing: 0.75},
        { note: "E5", duration: "8n", timing: 1}, { note: "B4", duration: "8n", timing: 1.25}, { note: "D5", duration: "8n", timing: 1.5}, { note: "C5", duration: "8n", timing: 1.75},
        { note: "A4", duration: "4n", timing: 2}] },
    
        { id: '3', name: "Seven Nation Army", genreId: '0', 
        content: [{note: "E5", duration: "4n", timing: 0}, {note: "E5", duration: "8n", timing: 0.5}, {note: "G5", duration: "4n", timing: 0.75}, {note: "E5", duration: "8n", timing: 1.25}, {note: "E5", duration: "8n", timing: 1.75}, {note: "G5", duration: "4n", timing: 1.75}, {note: "F#5", duration: "4n", timing: 2.25}] }
    ];

    genres = [
        { id: '0', genreName: "Rock"},
        { id: '1', genreName: "Classic"}
    ];

    nextTuneId = 4;
    nextGenreId = 2;
};

//Tune endpoints
app.get(apiPath + version + '/tunes', (req, res) => {
    let tuneArray = [];
        for (let i = 0; i < tunes.length; i++) {
            tuneArray.push({ id: tunes[i].id, name: tunes[i].name, genreId: tunes[i].genreId });
        }

    res.status(200).json(tuneArray);
});

app.get(apiPath + version + '/genres/:genreId/tunes/:tuneId', (req, res) => {
    for (let i = 0; i < tunes.length; i++) {
        if (tunes[i].id == req.params.tuneId) {
            if (tunes[i].genreId == req.params.genreId) {
                return res.status(200).json(tunes[i]);
            } else {
                return res.status(400).json({ 'message': "Tune with id " + req.params.tuneId + " does not belong to genre with id " + req.params.genreId + "." });
            }
        }
    }
    res.status(404).json({ 'message': "Tune with id " + req.params.tuneId + " does not exist." });
});

app.patch(apiPath + version + '/genres/:genreId/tunes/:tuneId', (req, res) => {
    if (req.body === undefined || 
        ((req.body.name === undefined || req.body.name === "") 
          && (req.body.content === undefined || typeof(req.body.content) !== 'object' || req.body.content.length === undefined || req.body.content.length <= 0)
          && (req.body.genreId === undefined || req.body.genreId === ""))
        ) {
        return res.status(400).json({ 'message': "To update a tune, you need to provide a name, a non-empty content array, or a new genreId." });
    } else {
        for (let i=0;i<tunes.length;i++) {
            if (tunes[i].id == req.params.tuneId) {
                if (tunes[i].genreId != req.params.genreId) {
                    return res.status(400).json({ 'message': "Tune with id " + req.params.tuneId + " does not have genre id " + req.params.genreId + "." });
                } else {
                    if (req.body.name !== undefined && req.body.name != "") {
                        tunes[i].name = req.body.name;
                    }

                    if ((req.body.content !== undefined && typeof(req.body.content) === 'object' && req.body.content.length !== undefined && req.body.content.length > 0)) {
                        tunes[i].content = req.body.content;
                    }

                    if (req.body.genreId !== undefined && req.body.genreId != "") {
                        let existsGenre = false;
                        for (let j=0; j<genres.length;j++) {
                            if (genres[j].id == req.body.genreId) {
                                tunes[i].genreId = req.body.genreId;
                                existsGenre = true;
                            }
                        }

                        if (!existsGenre) {
                            return res.status(404).json({ 'message': "Genre with id " + req.body.genreId + " does not exist." });
                        }
                    }            
                    return res.status(200).json(tunes[i]);
                }
            }
        }
        res.status(404).json({ 'message': "Tune with id " + req.params.tuneId + " does not exist." });
    }
});

app.post(apiPath + version + '/genres/:genreId/tunes', (req, res) => {
    if (req.body === undefined || req.body.name === undefined || req.body.name === "" || req.body.content.length > 0) {
        return res.status(400).json({ 'message': "Tunes require at least a name, and a non-empty content array." });
    } else {
        //Checking content validity
        for (let i=0;i<req.body.content.length;i++) {
            if (req.body.content[i].tone !== undefined || typeof(req.body.content[i].tone) !== "string" || req.body.content[i].duration !== undefined || typeof(req.body.content[i].duration) !== "string" || req.body.content[i].timing !== undefined || typeof(req.body.content[i].timing) !== "number") {
                return res.status(400).json({ 'message': "Content array needs tone, duration and timing." });
            }
        }

        for (let i=0;i<genres.length;i++) {
            if (genres[i].id == req.params.genreId) {
                let newTune = { id: String(nextTuneId), name: String(req.body.name), genreId: genres[i].id, content: req.body.content };
                tunes.push(newTune);
                nextTuneId++;
        
                return res.status(201).json(newTune);
            }
        }
        res.status(404).json({ 'message': "Genre with id " + req.params.genreId + " does not exist." });
    }
});

app.post(apiPath + version + '/genres', (req, res) => {  
    let hmacHash = sha256.hmac('tuneSecret', req.method.toLowerCase() + " " + req.path.toLowerCase());
    if (req.header("Authorization") === undefined) {
        return res.status(401).json({"message":"Unauthorized"});
    } else {
        let authMethod = req.header("Authorization").substring(0, 4);
        let hash = req.header("Authorization").substring(5);

        if (authMethod !== "HMAC") {
            return res.status(401).json({"message":"Wrong authorization method."});
        } else {
            if(hash !== hmacHash) {
                return res.status(401).json({"message":"Wrong hash."});
            }
        }
    }

    if (req.body === undefined || req.body.genreName === undefined || req.body.genreName === "") {
        return res.status(400).json({ 'message': "Genres require a genreName." });
    } else {
        let newGenre = { id: String(nextGenreId), genreName: String(req.body.genreName) };
        genres.push(newGenre);
        nextGenreId++;

        res.status(201).json(newGenre);
    }
});

//Default: Not supported
app.use('*', (req, res) => {
    res.status(405).send('Operation not supported.');
});

app.listen(port, () => {
    console.log("Tunes app listening on Port " + port);
});