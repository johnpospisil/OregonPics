// all the middleware functions are placed in an object named 'middlewareObj'
// which is exported at the end of the file.

var Pic = require("../models/pic");
var Comment = require("../models/comment");

var middlewareObj = {};

middlewareObj.checkPicOwnership = function(req, res, next) {
    if(req.isAuthenticated()) {
        Pic.findById(req.params.id, function(err, foundPic){
            if(err) {
                req.flash("error", "Pic not found.");
                res.redirect("/pics");
            } else {
                if(!foundPic) {
                    req.flash("error", "Item not found.");
                    res.redirect("back");
                }
                // Does the User "own" the pic?
                if(foundPic.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that.");
                    // redirect back to the last page that the User was on.
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that.");
        // redirect back to the last page that the User was on.
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
    if(req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err) {
                req.flash("error", "Comment not found.");
                res.redirect("back");
            } else {
                // Does the User "own" the comment?
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that.");
                    // redirect back to the last page that the User was on.
                    res.redirect("back");
                }
            }
        });
    } else {
        // redirect back to the last page that the User was on.
        req.flash("error", "You need to be Logged In to do that.");
        res.redirect("back");
    }
}

// if the user is authenticated, continue the code, i.e. 'return next();'
middlewareObj.isLoggedIn = function(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be Logged In to do that.");
    res.redirect("/login");
}

module.exports = middlewareObj;