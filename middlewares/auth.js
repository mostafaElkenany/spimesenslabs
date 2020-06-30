// middleware function to check for logged-in users
const auth = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) res.redirect('/home');
    else next();
}

module.exports = auth;