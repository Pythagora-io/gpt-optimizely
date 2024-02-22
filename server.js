// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const csurf = require('csurf'); // CSURF for CSRF protection
const authRoutes = require("./routes/authRoutes");
const apiRoutes = require('./routes/apiRoutes'); // Include API routes
const abTestRoutes = require('./routes/abTestRoutes'); // Include A/B test routes
const userRoutes = require('./routes/userRoutes'); // Include User routes for account and A/B test management
const cors = require('cors');

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
  console.error("Error: config environment variables not set. Please create/edit .env configuration file.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// Setting the templating engine to EJS
app.set("view engine", "ejs");

// Serve static files
app.use(express.static("public"));

// Database connection
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error(`Database connection error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  });

// Session configuration with connect-mongo
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
  }),
);

// CSURF Middleware for CSRF protection
app.use(csurf());

app.use(function (req, res, next) {
  res.locals.csrfToken = req.csrfToken(); // Pass the CSRF token to the views
  next();
});

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Logging session creation and destruction
app.use((req, res, next) => {
  const sess = req.session;
  // Make session available to all views
  res.locals.session = sess;
  if (!sess.views) {
    sess.views = 1;
    console.log("Session created at: ", new Date().toISOString());
  } else {
    sess.views++;
    console.log(
      `Session accessed again at: ${new Date().toISOString()}, Views: ${sess.views}, User ID: ${sess.userId || '(unauthenticated)'}`,
    );
  }
  next();
});

// Authentication Routes
app.use(authRoutes);

// API Routes
app.use(apiRoutes); // Use API routes in the application

// A/B Test Routes
app.use(abTestRoutes); // Use A/B test routes in the application

// User Routes for account and A/B tests management
app.use(userRoutes); // Use User routes in the application

// Root path response with authentication check
app.get("/", (req, res) => {
  if (req.session && req.session.userId) {
    res.render("index");
  } else {
    console.log("Redirecting unauthenticated user to login page.");
    res.redirect("/auth/login");
  }
});

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
