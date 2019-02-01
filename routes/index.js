var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Pic = require("../models/pic");
// Add these 3 lines to enable password reset
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto"); // does not need to be installed via npm, part of node

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
    var newUser = new User({
            // Notice that 'password' is not in the following section.
            // It is handled in the 'User.register' line below.
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            avatar: req.body.avatar
        });
    // locus allows us to stop the code at this point.
    // eval(require('locus'));
    if (req.body.adminCode === 'secretCode') {
        newUser.isAdmin = true;
    }
    
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


// FORGOT PASSWORD
// Password forgot GET Route
router.get('/forgot', function(req, res) {
  res.render('forgot');
});

// Password forgot POST Route
router.post('/forgot', function(req, res, next) {
    //async is an array of functions that get called in sequence. This reduces the number of callback functions that need to be used.
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
        
        // function(token, user, done) {
        // var smtpTransport = nodemailer.createTransport({
        //     host: 'smtp.gmail.com',
        //     port: 465,
        //     secure: true,
        //     auth: {
        //         type: 'OAuth2',
        //         user: 'audiofreak7@gmail.com',
        //         accessToken: token
        //         }   
        //     });
        
        
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'audiofreak7@gmail.com',
          pass: process.env.GMAILPW // GMAILPW is your Gmail password, stored in an environment variable. At the terminal, $ export GMAILPW=your-gmail-password
        }
      });
      // what the user will see in the email that they receive
      var mailOptions = {
        to: user.email,
        from: 'audiofreak7@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

// Reset Token GET Route
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

// Reset Token POST Route
// User enters the new password and confirms that password
router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          // passport-local-mongoose has a method called 'setPassword'. Just pass it a password, and it handles all of the salting and hashing.
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            
            // save the password data and login the user
            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    // email to confirm password change
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'audiofreak7@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'audiofreak7@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/pics');
  });
});




// USER PROFILE
router.get("/users/:id", function(req, res) {
    User.findById(req.params.id, function(err, foundUser) {
        if(err) {
            req.flash("error", "Something went wrong.");
            res.redirect("/");
        }
        // eval(require('locus'));
        Pic.find().where('author.id').equals(foundUser.id).exec(function(err, pic) {
            if(err) {
                req.flash("error", "Something went wrong.");
                res.redirect("/");
            }
            res.render("users/show", {user: foundUser, pic: pic});
        });
    });
});

module.exports = router;