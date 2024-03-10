const   express     = require('express'),
        bodyParser  = require('body-parser'),
        app         = express(),
        cors        = require('cors'),
        MongoClient = require('mongodb').MongoClient,
        data        = require('./config'),
        ObjectId    = require('mongodb').ObjectId,
        rateLimit   = require("express-rate-limit");

MongoClient.connect(data.url)
.then(client => {
    console.log('Connected sucessfully to DB');

    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    const   db                  = client.db('createposttool'),
            usersCollection     = db.collection('users'),
            postsCollection     = db.collection('posts');

    app.post('/signin', (req, res) => {
        usersCollection.findOne({
            name: req.body.username, 
            password: req.body.password
        })
        .then(result => {
            if (result) {
                res.send(result);
            } else {
                res.sendStatus(404)
            }
        })
    });

    app.post('/signup', (req, res) => {
        usersCollection.findOne({
            name: req.body.username, 
        })
        .then(result => {
            if (result) {
                res.sendStatus(403);
            } else {
                usersCollection.insertOne({
                    name: req.body.username,
                    password: req.body.password,
                    confirm_password: req.body.confirm_password
                }).then(resp => {
                    res.send(resp);
                })
            }
        })
    });

    app.get('/me/:id', (req, res) => {      
        let id = new ObjectId(req.params.id);
        console.log(id);
        usersCollection.findOne({
            _id: id
        })
        .then(result => {
            if (result) {
                res.send(result);
            } else {
                res.sendStatus(404)
            }
        })
    });

    app.get('/posts', (req, res) => {
        postsCollection.find().toArray()
        .then(result => {
            if (result) {
                res.send(result);
            } else {
                res.sendStatus(404);
            }
        })
    });

    app.get('/users', (req, res) => {
        usersCollection.find().toArray()
        .then(result => {
            if (result) {
                res.send(result);
            } else {
                res.sendStatus(404);
            }
        })
    });

    app.post('/post', (req, res) => {
        postsCollection.findOne({
            title: req.body.title,
            description: req.body.description,
            image: req.body.image,
            video: req.body.video,
            status: "active",
            deleted : false
        })
        .then(result => {
            if (result) {
                res.sendStatus(403);
            } else {
                postsCollection.insertOne({
                    title: req.body.title,
                    description: req.body.description,
                    image: req.body.image,
                    video: req.body.video,
                    status: "active",
                    deleted : false
                }).then((resp) => {
                    res.send(resp);
                })
            }
        })
    });

    app.listen(data.port, function() {
        console.log(`Listening on port ${data.port}`);
    });
})
.catch(error => console.log(error));