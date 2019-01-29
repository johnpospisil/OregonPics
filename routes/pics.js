var express = require("express");
var router = express.Router();
var Pic = require("../models/pic");
// an index.js file is actually being required below.
// 'index.js' is assumed to be the default route in JS, just like HTML.
var middleware = require("../middleware");

// BELOW for Google Maps
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);
// ABOVE for Google Maps

// INDEX Route - show all pics
router.get("/", function(req, res) { // show the pics
    // Get all pics from DB
    Pic.find({}, function(err, allPics){
        if(err){
            console.log(err);
        } else {
            res.render("pics/index",{pics:allPics});
        }
    });
});

//CREATE - add new pic to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to pics array
    var picName = req.body.picName;
    var picURL = req.body.picURL;
    var picDescription = req.body.picDescription;
    var cameraMake = req.body.cameraMake;
    var cameraModel = req.body.cameraModel;
    var focalLength = req.body.focalLength;
    var aperature = req.body.aperature;
    var shutterSpeed = req.body.shutterSpeed;
    var iso = req.body.iso;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
        console.log(err);
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newPic = {picName: picName, picURL: picURL, picDescription: picDescription, cameraMake: cameraMake, cameraModel: cameraModel, focalLength: focalLength, aperature: aperature, shutterSpeed: shutterSpeed, iso: iso, author: author, location: location, lat: lat, lng: lng};
    
    // Create a new pic and save to DB
    Pic.create(newPic, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to pics page
            console.log(newlyCreated);
            res.redirect("/pics");
        }
    });
  });
});

// NEW Pic Route - show form to add/create new pic
router.get("/new", middleware.isLoggedIn, function(req, res) { // show the form that will feed the post pics route.
   res.render("pics/new"); 
});

// SHOW Pic Route - show info about a specific pic
router.get("/:id", function(req, res) {
    //find the pic with the provided ID, then populate the comments for that pic,
    // then execute the query.
    Pic.findById(req.params.id).populate("comments").exec(function(err, foundPic) {
        if (err) {
            console.log(err);
        } else {
            if(!foundPic) {
                return res.status(400).send("Item not found.");
            }
            // console.log(foundPic);
            // render the show template with that pic
            res.render("pics/show", {pic: foundPic});
        }
    });
});

// EDIT Pic Route
router.get("/:id/edit", middleware.checkPicOwnership, function(req, res){
    Pic.findById(req.params.id, function(err, foundPic){
        if(err) {
            res.redirect("back");
        } else {
            res.render("pics/edit", {pic: foundPic});
        }
    });
});

// UPDATE PIC ROUTE
router.put("/:id", middleware.checkPicOwnership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
        console.log(err);
        req.flash('error', 'Invalid address');
        return res.redirect('back');
    }
    req.body.pic.lat = data[0].latitude;
    req.body.pic.lng = data[0].longitude;
    req.body.pic.location = data[0].formattedAddress;

    Pic.findByIdAndUpdate(req.params.id, req.body.pic, function(err, pic){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/pics/" + pic._id);
        }
    });
  });
});

// DESTROY Pic Route
router.delete("/:id", middleware.checkPicOwnership, function(req, res){
    Pic.findByIdAndRemove(req.params.id, function(err){
        if(err) {
            res.redirect("/pics");
        } else {
            res.redirect("/pics");
        }
    });
});




module.exports = router;