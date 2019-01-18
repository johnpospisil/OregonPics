var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

// This adds a bunch of methods from passport-local-mongoose to our UserSchema.
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);