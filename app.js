var express    = require("express"),
    app        = express(),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    flash      = require("connect-flash"),
    passport   = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override");
    // Campground = require("./models/campground"),
    // Comment    = require("./models/comment"),
    // User       = require("./models/user"),
    // seedDB     = require("./seeds");
  
// setup links to files containing routes  
// var indexRoutes = require("./routes/index"),
//     campgroundRoutes = require("./routes/campgrounds"),
//     commentRoutes = require("./routes/comments");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
    
// Routes
app.get("/", function(req, res) {
  res.render("landing") ;
});

app.get("/pics", function(req, res) {
  res.render("pics") ;
});




// END
app.listen(process.env.PORT, process.env.IP, function() {
   console.log("YelpCamp Server is listening!!!");
});