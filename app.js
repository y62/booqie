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

//____________________________________________________________________________

/*app.get("/test", (req, res) => {
    return res.sendFile(__dirname + "/frontend/test.html");
}); */

const connection = mysql.createConnection({
    host: 'database-2.c8e4q2gd2tmb.eu-central-1.rds.amazonaws.com',
    port: 3306,
    user: 'admin',
    password: '',
    database: 'nodelogin'
});

connection.connect(function(error){
    if(!!error) console.log(error);
    else console.log('Database Connected!');
});

//set views file
app.set('views',path.join(__dirname,'frontend/views'));

//set view engine
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


//ADMIN CRUD______________________________________________________________


app.get('/add',(req, res) => {
    res.render('admin_add', {
        title : 'Create a booqie admin'
    });
});

app.post('/save',(req, res) => {
    let data = {name: req.body.name, email: req.body.email, phone_no: req.body.phone_no, password: req.body.password};
    let sql = "INSERT INTO admins SET ?";

    let query = connection.query(sql, data,(err, results) => {
        if(err) throw err;
        res.redirect('/admins');
    });
});

app.get('/delete/:adminId',(req, res) => {
    const adminId = req.params.adminId;
    let sql = `DELETE from admins where id = ${adminId}`;
    let query = connection.query(sql,(err, result) => {
        if(err) throw err;
        res.redirect('/admins');
    });
});

app.get('/emailNotFound', (req, res) => {
});


//LOGIN_______________________________________________________________

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname + '/frontend/login.html'));
});

app.post('/auth', function(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    if (email && password) {
        connection.query('SELECT * FROM admins WHERE email = ? AND password = ?', [email, password], function(error, results, fields) {
            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.email = email;
                res.redirect('/admins');
            } else {
                res.send('Incorrect Email and/or Password!');
            }
            res.end();
        });
    } else {
        response.send('Please enter Email and Password!');
        response.end();
    }
});

app.get('/admins',(req, res) => {
   if (req.session.loggedin) {
       let sql = "SELECT * FROM admins";
       let query = connection.query(sql, (err, rows) => {
           if (err) throw err;
           res.render('admin_list', {
               title: 'Welcome to booqie admin list',
               admins: rows
           });
       });
   } else {
       console.log("cannot login")
   }
});

app.get('/home', function(req, res) {
    if (req.session.loggedin) {
        res.send('Welcome back, ' + req.session.email + '!');
    } else {
        res.send('Please login to view this page!');
    }
    res.end();
  
app.get("/", (req, res) => {
    return res.sendFile(__dirname + '/frontend/index.html');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + 'frontend/index.html')
})

app.listen(port, () => {
    console.log("Server is running on port:", port)
});

