var mongoose = require("mongoose");

// SCHEMA SETUP
// This is set up as a single schema for learning right now. 
// This will be broken out into separate files later as we refactor.
var picSchema = new mongoose.Schema({
    picName: String,
    picURL: String,
    picDescription: String,
    cameraMake: String,
    cameraModel: String,
    focalLength: String,
    aperature: String,
    shutterSpeed: String,
    iso: String,
    // Add the following three lines for Google Maps integration
    location: String,
    lat: Number,
    lng: Number,
    createdAt: { type: Date, default: Date.now },
    // this 'author' object helps associate a user with a newly created pic.
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
    ],
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    rating: {
        type: Number,
        default: 0
    }
}, {
    // if timestamps are set to true, mongoose assigns createdAt and updatedAt fields to your schema, the type assigned is Date.
    timestamps: true
});

module.exports = mongoose.model("Pic", picSchema);
