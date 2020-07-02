const express = require('express');
const redis = require('redis');
const _ = require('lodash');
const moment = require('moment');
const { isLoggedIn, auth } = require('../middlewares/auth');
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
router.get('', isLoggedIn, (req, res) => {
    res.redirect('/login');
})

router.get('/login', isLoggedIn, (req, res) => {
    res.render('login');
})

router.post('/login', (req, res, next) => {
    const { email, password } = req.body;
    User.findOne({ where: { email } })
        .then((user) => {
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
        .catch(error => next(error));
})

router.get('/signup', isLoggedIn, (req, res) => {
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
        .catch(sqlerr => {
            let error;
            if (sqlerr.errors) {
                errorMsg = sqlerr.errors[0].message;
            }
            res.render('signup', { errorMsg })
        });
})

router.get('/home', auth, (req, res) => {
    res.render('home');
})

//route to get login dates
router.get('/search', auth, (req, res, next) => {
    const { username } = req.query;

    //search for input username in mysql database
    User.findOne({ where: { username } })
        .then((user) => {
            if (_.isEmpty(user)) {
                error = "User not found";
                res.render('home', { error });
            } else {
                //get login dates from redis
                client.lrange(username, 0, -1, (err, result) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        // group login dates by day
                        const groupedDates = _.groupBy(result, (date) => {
                            return moment(date, "ddd-MMM-DD-YYYY").startOf('day').format("dddd, MMMM Do YYYY");
                        })

                        res.render('home', { groupedDates });
                    };
                })
            }
        })
        .catch(error => next(error));
})

router.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
    }
    res.redirect('/login')
})

module.exports = router