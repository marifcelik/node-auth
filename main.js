const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const router = require('./routers/authRouter');
const { authMiddleware, checkUser } = require('./middlewares/authMiddleware');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(cookieParser());
app.use(checkUser);
app.use('/', router);

const PORT = process.env.PORT || 4532;
const HOST = process.env.HOST || 'localhost';

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/smoothies', authMiddleware, (req, res) => {
    res.render('smoothies');
});

app.listen(PORT, async () => {
    mongoose.set('strictQuery', true);
    await mongoose.connect('mongodb://127.0.0.1:27017/jwt');

    console.log(`Server running at http://${HOST}:${PORT}/`);
});