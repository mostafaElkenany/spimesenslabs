const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/user');

require('dotenv').config()

const app = express();

const port = process.env.PORT || 5000;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(cors());
app.use(cookieParser());
app.use(session({
    key: 'user_sid',
    secret: process.env.SECRET || 'No Secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000 //expire in one hour
    }
}))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', userRouter)
// handling 404 requests
app.use(function (req, res, next) {
    res.status(404).send("Page not found!")
  });

// error handling middleware
app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).send('Something went wrong!')
})

app.listen(port, () => console.log(`Server working on port ${port}`));