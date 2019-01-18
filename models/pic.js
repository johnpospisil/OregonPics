var mongoose = require("mongoose");

// SCHEMA SETUP
// This is set up as a single schema for learning right now. 
// This will be broken out into separate files later as we refactor.
var picSchema = new mongoose.Schema({
    picName: String,
    picURL: String,
    picDescription: String,
    picLocation: String,
    cameraMake: String,
    cameraModel: String,
    focalLength: String,
    aperature: String,
    shutterSpeed: String,
    iso: String,
    // this 'author' object helps associate a user with a newly created campground.
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    // the comments property is an array of comment id's, not the comment data itself
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

module.exports = mongoose.model("Pic", picSchema);
