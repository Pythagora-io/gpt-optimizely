require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const csurf = require('csurf');
const User = require('./models/User');
const authRoutes = require("./routes/authRoutes");
const apiRoutes = require('./routes/apiRoutes');
const abTestRoutes = require('./routes/abTestRoutes');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { redirectToLoginIfNotAuthenticated } = require('./routes/middleware/authMiddleware');

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET || !process.env.SERVER_URL) {
  console.error("Error: config environment variables not set. Please create/edit .env configuration file.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:8081',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'CSRF-Token'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", process.env.SERVER_URL, 'https://cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'wss:', 'https:', 'http:'],
      fontSrc: ["'self'", 'https:', 'data:'],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
      workerSrc: ["'self'", 'blob:'],
      childSrc: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
}));

app.use('/loader.js', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

app.set("view engine", "ejs");

app.get('/loader.js', (req, res) => {
  fs.readFile(path.join(__dirname, 'public', 'loader.js'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading loader.js file:', err);
      return res.status(500).send('Error serving loader script.');
    }
    const updatedData = data.replace('%%SERVER_URL%%', process.env.SERVER_URL);
    res.type('application/javascript').send(updatedData);
  });
});

app.use(express.static("public"));

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

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
    cookie: { secure: false, httpOnly: true, sameSite: 'lax' }
  }),
);

app.use(function (req, res, next) {
  if (req.path === '/api/tests/track' || req.path === '/api/tests/config' || req.path === '/loader.js' || (req.path === '/api/tests/impression' && req.method === 'POST')) {
    return next();
  }
  csurf()(req, res, next);
});

app.use(function (req, res, next) {
  if (req.csrfToken) {
    res.locals.csrfToken = req.csrfToken();
  }
  next();
});

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

app.use((req, res, next) => {
  const sess = req.session;
  res.locals.session = sess;
  if (!sess.views) {
    sess.views = 1;
    console.log("Session created at: ", new Date().toISOString());
  } else {
    sess.views++;
    console.log(
      `Session accessed again at: ${new Date().toISOString()}, Views: ${sess.views}, User ID: ${sess.userId || '(unauthenticated)'}`
    );
  }
  next();
});

app.use(authRoutes);

app.use('/api/tests/track', async (req, res, next) => {
  const apiKey = req.body.apiKey;
  if (!apiKey) {
    return res.status(401).send('API Key is required');
  }
  const user = await User.findOne({ apiKey });
  if (!user) {
    return res.status(401).send('Invalid API Key');
  }
  next();
});

app.use(apiRoutes);

app.use(abTestRoutes);

app.use(userRoutes);

app.get("/", redirectToLoginIfNotAuthenticated, (req, res) => {
  res.redirect("/tests/management");
});

app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});