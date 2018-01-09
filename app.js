const express = require("express");
const app = express();
const passport = require("./passportConfig.js");
const LocalStrategy = require("passport-local").Strategy;
var mongoose = require("mongoose");
var models = require("./models");
var User = mongoose.model("User");

// ----------------------------------------
// App Variables
// ----------------------------------------
app.locals.appName = "My App";

// ----------------------------------------
// ENV
// ----------------------------------------
if (process.env.NODE_ENV !== "production") {
  console.log("not production");
  require("dotenv").config();
}

const photos = require("./routers/photos");
const login = require("./routers/login");
const users = require("./routers/user");

// ----------------------------------------
// Body Parser
// ----------------------------------------
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// ----------------------------------------
// Sessions/Cookies
// ----------------------------------------
const cookieSession = require("cookie-session");

app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET || "secret"]
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// ----------------------------------------
// Flash Messages
// ----------------------------------------
const flash = require("express-flash-messages");
app.use(flash());

// ----------------------------------------
// Method Override
// ----------------------------------------
const methodOverride = require("method-override");
const getPostSupport = require("express-method-override-get-post-support");

app.use(
  methodOverride(
    getPostSupport.callback,
    getPostSupport.options // { methods: ['POST', 'GET'] }
  )
);

// ----------------------------------------
// Referrer
// ----------------------------------------
app.use((req, res, next) => {
  req.session.backUrl = req.header("Referer") || "/";
  next();
});

// ----------------------------------------
// Public
// ----------------------------------------
app.use(express.static(`${__dirname}/public`));

// ----------------------------------------
// Logging
// ----------------------------------------
const morgan = require("morgan");
const morganToolkit = require("morgan-toolkit")(morgan);

app.use(morganToolkit());

// ----------------------------------------
// Routes
// ----------------------------------------

app.use(passport.initialize());
app.use(passport.session());

//passport settings
mongoose.connect("mongodb://localhost/photo_gallery");

app.use("/login", login);
app.use("/photos", photos);
app.use("/users", users);

app.get("/register", (req, res) => {
  res.render("welcome/login");
});

app.post("/register", (req, res, next) => {
  const { username, password } = req.body;
  const user = new User({ username, password });
  user.save((err, user) => {
    req.login(user, function(err) {
      if (err) {
        return next(err);
      }
      return res.redirect("/");
    });
  });
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

app.get("/", (req, res) => {
  if (req.user) {
    console.log(req.user);
    app.locals.username = req.user.username;

    res.render("welcome/home", { user: req.user });
  } else {
    res.redirect("/login");
  }
});

// ----------------------------------------
// Template Engine
// ----------------------------------------
const expressHandlebars = require("express-handlebars");
const helpers = require("./helpers");

const hbs = expressHandlebars.create({
  helpers: helpers,
  partialsDir: "views/",
  defaultLayout: "application"
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

// ----------------------------------------
// Server
// ----------------------------------------
const port = process.env.PORT || process.argv[2] || 3000;
const host = "localhost";

let args;
process.env.NODE_ENV === "production" ? (args = [port]) : (args = [port, host]);

args.push(() => {
  console.log(`Listening: http://${host}:${port}\n`);
});

if (require.main === module) {
  app.listen.apply(app, args);
}

// ----------------------------------------
// Error Handling
// ----------------------------------------
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.stack) {
    err = err.stack;
  }
  res.status(500).render("errors/500", { error: err });
});

module.exports = app;
