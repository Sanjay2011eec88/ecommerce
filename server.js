var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
var User = require('./models/user');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var ejsMate = require('ejs-mate');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('express-flash');
var app = express();

mongoose.connect('mongodb://localhost:27017/ecommerce', function (err) {
   if(err){
       console.log(err);
   } else {
       console.log("Connected to the database");
   }
});

app.use(express.static(__dirname + '/public'));
//To log the routes
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({encoded: true}));
app.use(cookieParser());
app.use(session({
    resave: true,  //Forces the session to save back session store
    saveUninitialized: true, //Forces the session which is uninitizalied to save , a session is uninitizalied when it is new
    secret:"Pass@123"
}));
app.use(flash());
app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');

var mainRoutes = require('./routes/main');
var userRoutes = require('./routes/user');
app.use(mainRoutes);
app.use(userRoutes);

app.listen(3004, function (err) {
    if(err) throw err;
    console.log("Server is running");
});

