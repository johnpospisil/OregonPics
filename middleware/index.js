// all the middleware functions are placed in an object named 'middlewareObj'
// which is exported at the end of the file.

var Pic = require("../models/pic");
var Comment = require("../models/comment");
var Review = require("../models/review");

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

middlewareObj.checkReviewOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, function(err, foundReview){
            if(err || !foundReview){
                res.redirect("back");
            }  else {
                // does user own the comment?
                if(foundReview.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Pic.findById(req.params.id).populate("reviews").exec(function (err, foundPic) {
            if (err || !foundPic) {
                req.flash("error", "Pic not found.");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundPic.reviews
                var foundUserReview = foundPic.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("/pics/" + foundPic._id);
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};

// if the user is authenticated, continue the code, i.e. 'return next();'
middlewareObj.isLoggedIn = function(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be Logged In to do that.");
    res.redirect("/login");
}

module.exports = middlewareObj;