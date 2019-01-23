var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Pic = require("../models/pic");
// Add these 3 lines to enable password reset
// var async = require("async");
// var nodemailer = require("nodemailer");
// var crypto = require("crypto");

// ROUTES - most routes moved to ther files in the '/route' folder.
router.get("/", function(req, res) {
  res.render("landing") ;
});


// =====================
// AUTHENTICATION ROUTES
// =====================

// Show registration form
router.get("/register", function(req, res){
    res.render("register");
});

// Sign Up logic
router.post("/register", function(req,res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user) {
        if(err) {
            // console.log(err);
            req.flash("error", err.name + ": " + err.message +".");
            return res.redirect('/register');
        }
        // logs in the user using the serialize method, using the 'local' strategy
        // you can swap 'local' to 'twitter', 'facebook' to change login strategy
        passport.authenticate("local")(req, res, function() {
            req.flash("success", "Welcome to OregonPics " + user.username + "! You are currently Logged In.");
            res.redirect("/pics");
        });
    });
});

// LOGIN ROUTES
// render login form
router.get("/login", function(req, res) {
    res.render("login");
});

// Login Logic
// POST to '/login'. Route based on login success or failure
// Middleware starts at 'passport' and ends after the 'failureRedirect'
// When a user tries to login, authenticate their credentials.
// If the login info exists in the DB, route to '/pics'
// otherwise, route to '/login'
router.post("/login", passport.authenticate("local", {
    successRedirect: "/pics",
    failureRedirect: "/login"
}), function(req, res) {
});

//Log Out
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/pics");
});

module.exports = router;