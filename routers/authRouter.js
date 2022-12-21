const { Router } = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = Router();

function createToken(id) {
    return jwt.sign({ id }, process.env.SECRET, { expiresIn: 60 * 60 })
}

function errorHandler(err) {
    let error = {}, code = 400;

    if (err.name === 'LoginError') {
        error = { [err.type]: err.message }
        code = 401
    }
    else if (err.code === 11000) {
        error = { email: 'email is exist', detail: err.message, value: err.keyValue.email }
    }
    else if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            error = { ...error, [properties.path]: properties.message }
        })
    }
    else {
        error = { error: err.name, detail: err.message }
        code = 500;
    }

    return { code, error }
}

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user_id = await User.login(email, password)
        const token = createToken(user_id);
        res.cookie('jwt', token, { httpOnly: true, sameSite: 'none', maxAge: 60 * 60 * 1000 });
        res.status(200).json({ user: user_id });
    } catch (e) {
        const { code, error } = errorHandler(e)
        res.status(code).json({ error: error });
    }
});

router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.create({ email, password })
        const token = createToken(user._id)
        res.cookie('jwt', token, { httpOnly: true, sameSite: 'none', maxAge: 60 * 60 * 1000 });
        res.status(201).json({ message: 'succes', user: user._id })
    } catch (e) {
        const { code, error } = errorHandler(e);
        res.status(code).json({ error: error });
    }
});

router.get('/logout', (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
});

module.exports = router