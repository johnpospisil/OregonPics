var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    avatar: String,
    firstName: String,
    lastName: String,
    email: String,
    bio: String,
    isAdmin: {type: Boolean, default: false}
});

// This adds a bunch of methods from passport-local-mongoose to our UserSchema.
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);