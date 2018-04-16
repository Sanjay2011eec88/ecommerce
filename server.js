var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
var User = require('./models/user');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var ejsMate = require('ejs-mate');
var app = express();

mongoose.connect('mongodb://localhost:27017/ecommerce', function (err) {
   if(err){
       console.log(err);
   } else {
       console.log("Connected to the database");
   }
});

//To log the routes
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({encoded: true}));
app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');

app.post('/create-user',function (req,res,next) {
   var user = new User();
   user.profile.name = req.body.name;
   user.password =req.body.password;
   user.email = req.body.email;

   user.save(function (err) {
       if(err) return next(err);
       res.json("Successfully created a new user");
   });
});

app.get('/', function (req,res) {
   res.render('main/home');
});
app.listen(3000, function (err) {
    if(err) throw err;
    console.log("Server is running");
});

