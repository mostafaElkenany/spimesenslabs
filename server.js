const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/user');

require('dotenv').config()

const app = express();

const port = process.env.PORT || 6000;

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

app.listen(port, () => console.log(`Server working on port ${port}`));