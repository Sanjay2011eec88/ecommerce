var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var UserSchema = new mongoose.Schema({
   email: {
       type:String,
       unique: true,
       lowercase: true
   },
   password : String,
   profile: {
       name: {
           type: String,
           default: ''
       },
       picture: {
           type: String,
           default:''
       }
   },
   address: String,
   history: [{
       date: Date,
       paid: {
           type: Number,
           default: 0
       }
       // item: {
       //     type: Schema.Types.ObjectId,
       //     ref: ''
       // }
   }]
});

//Before saving password first we check if it is modified or not,
// if it is not modified than we bucrypt the password before savig it to db
UserSchema.pre('save',function (next) {
    var user = this;
    if(!user.isModified('password')) return next();
    bcrypt.genSalt(10, function (err,salt) {
        if(err) return next(err);
        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if(err) return next(err);
            user.password = hash;
            next();
        })
    })
});

//Compare the passwrord in the database and the password received in from the server
UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);