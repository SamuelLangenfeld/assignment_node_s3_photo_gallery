const express = require("express");
const router = express.Router({ strict: true });
const FileUpload = require("../FileUpload");
var mongoose = require("mongoose");
var models = require("./../models");
var User = mongoose.model("User");
var passport = require("./../passportConfig");
var photos = require("../data/photos.json");

// ----------------------------------------
// Index
// ----------------------------------------
router.get("/", async (req, res) => {
  const users = await User.find();

  res.render("users/index", { users });
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  let userPhotos = [];
  Object.keys(photos).forEach(photo => {
    if (photos[photo].user === user.username) {
      userPhotos.push(photos[photo]);
    }
  });

  res.render("users/show", { user, photos: userPhotos });
});

module.exports = router;
