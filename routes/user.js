const express = require('express');
const redis = require('redis');
const _ = require('lodash');
const moment = require('moment');
const auth = require('../middlewares/auth');
const User = require('../models/user');

const router = express.Router();

// creating redis client
const client = redis.createClient();
client.on("connect", () => {
    console.log('Conncted to redis...');

});
client.on("error", (error) => {
    console.error(error);
});

// adding routes to express router
router.get('', auth, (req, res) => {
    res.redirect('/login');
})

router.get('/login', auth, (req, res) => {
    res.render('login');
})

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    User.findOne({ where: { email } })
        .then(function (user) {
            if (user && user.validatePssword(password)) {
                req.session.user = user.dataValues;

                const username = user.dataValues.username
                const date = new Date();

                //store user login dates in redis
                client.lpush(username, date, (err, res) => {
                    if (err) console.log(err);
                    else console.log(res);
                });

                res.redirect('/home');
            }
            else res.render('login', { error: 'Wrong email or password' })
        })
        .catch(error => console.log(error));
})

router.get('/signup', auth, (req, res) => {
    res.render('signup');
})

router.post('/signup', (req, res) => {
    const { firstName, lastName, username, email, city, dateOfBirth, password } = req.body
    User.create({
        firstName,
        lastName,
        username,
        email,
        city,
        dateOfBirth,
        password
    })
        .then(user => {
            res.render('login', { message: 'Account created successfully' });
        })
        .catch(err => {
            let error;
            if (err.errors) error = err.errors[0].message;
            res.render('signup', { error })
        });
})

router.get('/home', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.render('home');
    }
    else res.redirect('/login');
})

//route to get login dates
router.get('/search', (req, res) => {
    // console.log(req.query);
    const { username } = req.query;

    //get login dates from redis
    client.lrange(username, 0, -1, (err, result) => {
        if (err) console.log(err);
        else {
            // group login dates by day
            const groupedDates = _.groupBy(result, (date) => {
                return moment(date, "MM-DD-YYYY").startOf('day').format("dddd, MMMM Do YYYY");
            })

            res.render('home', { groupedDates });
        };
    })
})

router.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
    }
    res.redirect('/login')
})

module.exports = router