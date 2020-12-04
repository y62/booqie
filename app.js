require('dotenv').config();

const express = require("express");
const mysql = require('mysql');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const ejs = require('ejs');
const nodemon = require("nodemon");
const app = express();
const port = 8080;

app.use(express.static("frontend"));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.set('views',path.join(__dirname,'frontend/views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const connection = mysql.createConnection({
    host: process.env.HOST,
    port: process.env.PORT,
    user: process.env.DATAUSER,
    password: process.env.DATAPASS,
    database: process.env.DATABASE
});

connection.connect((error) => {
    if (error) {
        console.log(error);
    }
    else {
        console.log('Database Connected!');
    }
});

app.get('/register',(req, res) => {
    res.render('register_user', {
        title : 'Booqie User registration'
    });
});


app.post('/save_user_registration',(req, res) => {
    let data = {email: req.body.email, password: req.body.password, name: req.body.name, age: req.body.age, gender: req.body.gender, address: req.body.address, phone_number: req.body.phone_number};
    let sql = "INSERT INTO users SET ?";
        connection.query(sql, data,(err, results) => {
        if (err) throw err;
        res.redirect('/users');
    });
});


app.get('/delete/:userId',(req, res) => {
    const userId = req.params.userId;
    let sql = `DELETE from users where id = ${userId}`;
    connection.query(sql,(err, result) => {
        if(err) throw err;
        res.redirect('/users');
    });
});

//SESSION_______________________________________________________________

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.get('/login', function(request, response) {
    response.sendFile(path.join(__dirname + '/frontend/login.html'));
});

app.post('/auth', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if (email && password) {
        connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (error, results, fields) => {
            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.email = email;
                res.redirect('/home');
            } else {
                res.send('Forkert Email eller Adgangskode');
            }
            res.end();
        });
    } else {
        res.send('Please enter Email and Password!');
        res.end();
    }
});

app.get('/users',(req, res) => {
    if (req.session.loggedin) {
        let sql = "SELECT * FROM users";
        let query = connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.render('user_list', {
                title: 'Booqies aktive medlemmer',
                users: rows
            });
        });
    } else {
        console.log("cannot login");
    }
});

app.get('/home', (req, res) => {
    if (req.session.loggedin) {
        res.send('<h1> Velkommen, ' + req.session.email + '! </h1>');
    } else {
        res.send('Please login to view this page!');
        //__dirname + '/frontend/login.html'
    }
    res.end();
});

app.get("/prices", (req, res) => {
        return res.sendFile(__dirname + '/frontend/prices.html');
    });

app.get("/functionalities", (req, res) => {
    return res.sendFile(__dirname + '/frontend/functionalities.html');
});

app.listen(port, () => {
        console.log("Server is running on port:", port);
    });
