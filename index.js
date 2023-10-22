const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require("mongoose");
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

const salt = bcrypt.genSaltSync(10);
const secret = 'asdfghjklyuiop';

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieParser())

dotenv.config({ path: './config.env' })

mongoose.connect(process.env.MONGODB_URL);

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const UserDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt),
        });

        res.json(UserDoc);
    } catch (e) {
        console.log(e);
        res.status(400).json(e);
    }

});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const UserDoc = await User.findOne({ username });
    const passOk = bcrypt.compareSync(password, UserDoc.password);
    // res.json(passOk);
    // res.json(UserDoc);
    if (passOk) {
        //logged in
        jwt.sign({ username, id: UserDoc._id }, secret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token).json({
                id: UserDoc._id,
                username,
            });
        })

    } else {
        res.status(400).json('wrong credentials');
    }
});

app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, (err, info) => {
        if (err) throw err;
        res.json(info);
    });
});

app.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok');
})

app.listen(4000);