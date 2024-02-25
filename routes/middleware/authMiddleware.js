const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next(); // User is authenticated, proceed to the next middleware/route handler
  } else {
    return res.status(401).send('You are not authenticated'); // User is not authenticated
  }
};

const redirectToLoginIfNotAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    console.log("Redirecting unauthenticated user to login page.");
    return res.redirect('/auth/login');
  } else {
    next(); // Proceed if authenticated
  }
};

module.exports = {
  isAuthenticated,
  redirectToLoginIfNotAuthenticated
};