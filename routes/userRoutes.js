const express = require('express');
const router = express.Router();
const { isAuthenticated, redirectToLoginIfNotAuthenticated } = require('./middleware/authMiddleware');
const User = require('../models/User');
const AbTest = require('../models/AbTest');

router.get('/account', redirectToLoginIfNotAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            console.log(`User not found with ID: ${req.session.userId}`);
            return res.status(404).send('User not found');
        }
        console.log(`Rendering account page for user: ${user.username}`);
        console.log(`Current allowed origins: ${user.allowedOrigins}`);
        res.render('account', { user, req });
    } catch (error) {
        console.error(`Error fetching user details: ${error.message}`, error.stack);
        res.status(500).send('Internal server error');
    }
});

router.post('/account/update-origins', redirectToLoginIfNotAuthenticated, async (req, res) => {
    try {
        const { action, origin } = req.body;
        const user = await User.findById(req.session.userId);

        if (action === 'add') {
            user.allowedOrigins.push(origin);
            console.log(`Added new origin ${origin} for user ${user.username}`);
        } else if (action === 'remove') {
            user.allowedOrigins = user.allowedOrigins.filter(o => o !== origin);
            console.log(`Removed origin ${origin} for user ${user.username}`);
        }

        await user.save();
        console.log(`Updated allowed origins for user ${user.username}: ${user.allowedOrigins}`);
        res.redirect('/account');
    } catch (error) {
        console.error(`Error updating allowed origins: ${error.message}`, error.stack);
        res.status(500).send('Internal server error');
    }
});

router.get('/tests/management', redirectToLoginIfNotAuthenticated, async (req, res) => {
    try {
        const tests = await AbTest.find({ createdBy: req.session.userId });
        console.log(`Rendering A/B tests management page for user ID: ${req.session.userId}`);
        res.render('abTests', { tests });
    } catch (error) {
        console.error(`Error fetching A/B tests: ${error.message}`, error.stack);
        res.status(500).send('Internal server error');
    }
});

router.get('/tests/new', redirectToLoginIfNotAuthenticated, (req, res) => {
    try {
        console.log("Rendering the 'Create New Test' form.");
        res.render('testForm');
    } catch (error) {
        console.error(`Error displaying the 'Create New Test' form: ${error.message}`, error.stack);
        res.status(500).send('Internal server error while rendering the new test form.');
    }
});

router.get('/tests/:testId/edit', redirectToLoginIfNotAuthenticated, async (req, res) => {
    try {
        const test = await AbTest.findById(req.params.testId);
        if (!test) {
            console.log(`A/B Test not found with ID: ${req.params.testId}`);
            return res.status(404).send('A/B Test not found');
        }
        console.log(`Rendering edit form for A/B Test: ${test.testName}`);
        res.render('editTestForm', { test });
    } catch (error) {
        console.error(`Error fetching A/B test for edit: ${error.message}`, error.stack);
        res.status(500).send('Internal server error while fetching A/B test for edit.');
    }
});

router.post('/tests/:testId/toggle-status', isAuthenticated, async (req, res) => {
    try {
        const test = await AbTest.findById(req.params.testId);
        if (!test) {
            console.log(`A/B Test not found with ID: ${req.params.testId}`);
            return res.status(404).send('A/B Test not found');
        }
        test.testStatus = test.testStatus === 'Running' ? 'Stopped' : 'Running';
        await test.save();
        console.log(`Test status toggled: ${test.testName} is now ${test.testStatus}`);
        res.redirect('/tests/management');
    } catch (error) {
        console.error(`Error toggling test status: ${error.message}`, error.stack);
        res.status(500).send('Error toggling test status.');
    }
});

router.get('/', async (req, res) => {
  const tooltips = [
    { title: "Built with Pythagora", description: "Optimize your website with powerful A/B testing" },
    { title: "Create A/B Tests", description: "Easily set up tests to compare different versions of your web pages" },
    { title: "Track Results", description: "Monitor the performance of your tests in real-time" },
    { title: "Make Data-Driven Decisions", description: "Use insights from your tests to improve your website" }
  ];

  let userTests = [];
  if (req.session.userId) {
    userTests = await AbTest.find({ createdBy: req.session.userId });
  }

  res.render('index', {
    tooltips,
    userTests,
    user: req.session.userId ? { id: req.session.userId } : null,
    csrfToken: req.csrfToken()
  });
});

module.exports = router;