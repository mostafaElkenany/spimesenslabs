const express = require('express');
const auth = require('../middlewares/auth');
const User = require('../models/user');

const router = express.Router();

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

router.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
    }
    res.redirect('/login')
})

module.exports = router