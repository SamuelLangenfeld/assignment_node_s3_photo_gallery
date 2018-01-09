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
  console.log(photos);
  res.render("photos/index", { photos });
});

// ----------------------------------------
// New
// ----------------------------------------
router.get("/new", (req, res) => {
  res.render("photos/new");
});

// ----------------------------------------
// Create
// ----------------------------------------
const mw = FileUpload.single("photo[file]");
router.post("/", mw, (req, res, next) => {



  if (req.user) {
    
 
  console.log("Files", req.file);

  FileUpload.upload({
    data: req.file.buffer,
    name: req.file.originalname,
    mimetype: req.file.mimetype
  })
    .then(data => {
      console.log(data);
      req.flash("success", "Photo created!");
      res.redirect("/photos");
    })
    .catch(next);

  } else {
    req.method="GET"
    res.redirect("/login");
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
    req.method="GET"
    res.redirect("/login");
});

module.exports = router;
