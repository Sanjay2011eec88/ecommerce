var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
var config = require('./config/secret');

//Models
var User = require('./models/user');
var Category = require('./models/category');

var bodyParser = require('body-parser');
var ejs = require('ejs');
var ejsMate = require('ejs-mate');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('express-flash');
var MongoStore = require('connect-mongo')(session);//It is use for storing session in db 
var passport = require('passport');

var cartLength = require('./middlewares/middlewares');

var app = express();

mongoose.connect(config.dataBaseName, function (err) {
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
    secret:config.secretKey,
    store: new MongoStore({url:config.dataBaseName,autoReconnect: true})
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){
    res.locals.user = req.user;
    next();
});

app.use(cartLength);
app.use(function(req,res,next){
    Category.find({}, function(err, categories){
        if(err) return next(err);
        res.locals.categories = categories;
        next();
    })
})

app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');

var mainRoutes = require('./routes/main');
var userRoutes = require('./routes/user');
var adminRoutes = require('./routes/admin');
var apiRoutes = require('./api/api');
app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use('/api',apiRoutes);

app.listen(config.port, function (err) {
    if(err) throw err;
    console.log("Server is running on port "+config.port);
});

