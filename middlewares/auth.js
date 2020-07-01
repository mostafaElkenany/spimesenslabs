//helper function
const checkSession = (req) => {
    if (req.session.user && req.cookies.user_sid) return true;
    else return false;
}

// middleware to redirect logged in users to home page
const isLoggedIn = (req, res, next) => {
    if (checkSession(req)) res.redirect('/home');
    else next();
}

// middleware to redirect users to log-in page if user didn't log in
const auth = (req, res, next) => {
    if (checkSession(req)) next();
    else res.redirect('/login');
}

module.exports = { isLoggedIn, auth };