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

    const   db                  = client.db('rest-users'),
            usersCollection     = db.collection('users'),
            postsCollection     = db.collection('rest_posts');

    app.post('/login', (req, res) => {
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
                    business_name: req.body.business_name,
                    type_business: req.body.type_business,
                    name: req.body.username,
                    password: req.body.password,
                    who: req.body.who,
                    bonus: req.body.bonus
                }).then(resp => {
                    res.send(resp.insertedId);
                })
            }
        })
    });

    app.get('/me/:id', (req, res) => {      
        let id = new ObjectId(req.params.id);
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

    app.get('/posts/:business_name', (req, res) => {
        postsCollection.find({
            business_name : req.params.business_name,
            deleted : false
        }).toArray()
        .then(result => {
            if (result) {
                res.send(result);
            } else {
                res.sendStatus(404);
            }
        })
    });

    app.get('/users', (req, res) => {
        usersCollection.find({
            who : "visitor"
        }).toArray()
        .then(result => {
            if (result) {
                res.send(result);
            } else {
                res.sendStatus(404);
            }
        })
    });

    app.post('/offer', (req, res) => {
        postsCollection.findOne({
            condition: req.body.condition,
            required_bonuses: req.body.required_bonuses,
            gift: req.body.gift,
            deleted : false
        })
        .then(result => {
            if (result) {
                res.sendStatus(403);
            } else {
                postsCollection.insertOne({
                    business_name: req.body.business_name,
                    condition: req.body.condition,
                    required_bonuses: req.body.required_bonuses,
                    gift: req.body.gift,
                    deleted : false
                }).then(() => {
                    res.sendStatus(200);
                })
            }
        })
    });

    app.delete('/posts', (req, res) => {      
        let id = new ObjectId(req.body.id);
        postsCollection.updateOne(
            {
                _id: id,
                deleted: false
            },
            {$set: {deleted: true}}
        )
        .then(result => {
            if (result) {
                res.send(result);
            } else {
                res.sendStatus(404)
            }
        })
    });

    app.get('/oldPosts/:business_name', (req, res) => {
        postsCollection.find({
            business_name : req.params.business_name,
            deleted : true
        }).toArray()
        .then(result => {
            if (result) {
                res.send(result);
            } else {
                res.sendStatus(404);
            }
        })
    });

    app.post('/returnPost', (req, res) => {
        let id = new ObjectId(req.body.id);
        postsCollection.updateOne(
            {
                _id: id,
                deleted: true
            },
            {$set: {deleted: false}}
        )
        .then(result => {
            if (result) {
                res.send(result);
            } else {
                res.sendStatus(404)
            }
        })
    });

    app.post('/spendbonus', (req, res) => {
        let id = new ObjectId(req.body.id);
        usersCollection.updateOne(
            {
                _id: id,
                bonus: {$gt: 0}
            },
            {$inc: {bonus: -req.body.bonus}}
        )
        .then(result => {
            if (result) {
                res.send(result);
            } else {
                res.sendStatus(404)
            }
        })
    });

    app.use(
        rateLimit({
          windowMs: 24 * 60 * 60 * 1000,
          max: 1,
          headers: true
        })
    );

    app.post('/getbonus', (req, res) => {
        let id = new ObjectId(req.body.id);
        usersCollection.updateOne(
            {
                _id: id
            },
            {$inc: {bonus: 1}}
        )
        .then(result => {
            if (result) {
                res.send(result);
            } else {
                res.sendStatus(404)
            }
        })
    });

    app.listen(data.port, function() {
        console.log(`Listening on port ${data.port}`);
    });
})
.catch(error => console.log(error));