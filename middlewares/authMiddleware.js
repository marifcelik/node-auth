const jwt = require('jsonwebtoken');
const User = require('../models/User');

function authMiddleware(req, res, next) {
    const token = req.cookies?.jwt;
    if (!token) res.redirect('/login');
    const data = jwt.verify(token, process.env.SECRET)
    if (!data) res.redirect('login')
    next();
}

async function checkUser(req, res, next) {
    const token = req.cookies?.jwt;
    res.locals.user = null;
    if (!token) next();
    try {
        const data = jwt.verify(token, process.env.SECRET)
        if (!data) next();
        res.locals.user = await User.findById(data.id)
        next();
    } catch (e) {
        if (!(e instanceof jwt.JsonWebTokenError))
            console.error(e)
    }
}

module.exports = { authMiddleware, checkUser }