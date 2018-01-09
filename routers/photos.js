const express = require("express");
const router = express.Router();
const FileUpload = require("../FileUpload");
var mongoose = require("mongoose");
var models = require("./../models");
var User = mongoose.model("User");
var passport = require("./../passportConfig");

// ----------------------------------------
// Index
// ----------------------------------------
router.get("/", (req, res) => {
  const photos = require("./../data/photos");
  let photosArray = Object.keys(photos).map(photoKey => {
    return photos[photoKey];
  });
  photosArray.sort(function(a, b) {
    a = a.timestamp;
    b = b.timestamp;
    return a > b ? -1 : a < b ? 1 : 0;
  });
  res.render("photos/index", { photos: photosArray });
});

// ----------------------------------------
// New
// ----------------------------------------
router.get("/new", (req, res) => {
  res.render("photos/new");
});

router.get("/:name", (req, res) => {
  const photos = require("./../data/photos");
  const photo = photos[req.params.name];
  res.render("photos/photoshow", { photo });
});
// ----------------------------------------
// Create
// ----------------------------------------
const mw = FileUpload.single("photo[file]");
router.post("/", mw, async (req, res, next) => {
  if (req.user) {
    console.log("Files", req.file);

    // let user =await User.findById(req.user.id);
    // user.photos.push(req.file.originalname);
    // await user.save();

    FileUpload.upload({
      data: req.file.buffer,
      name: req.file.originalname,
      mimetype: req.file.mimetype,
      user: req.user.username
    })
      .then(data => {
        console.log(data);
        req.flash("success", "Photo created!");
        res.redirect("/photos");
      })
      .catch(next);
  } else {
    req.method = "GET";
    res.redirect("/login");
  }
});

// ----------------------------------------
// Destroy
// ----------------------------------------
router.delete("/:id", (req, res, next) => {
  if (req.user) {
    FileUpload.remove(req.params.id)
      .then(() => {
        res.redirect("/photos");
      })
      .catch(next);
  } else {
    req.method = "GET";
    res.redirect("/login");
  }
});

module.exports = router;
