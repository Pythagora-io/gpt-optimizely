const express = require('express');
const AbTest = require('../models/AbTest');
const { isAuthenticated } = require('./middleware/authMiddleware');
const router = express.Router();

// Creating a new A/B test
router.post('/tests/create', isAuthenticated, async (req, res) => {
  try {
    const { testName, pagePaths, IDparent, IDclick, htmlContentA, htmlContentB } = req.body;
    const newTest = await AbTest.create({
      testName,
      testStatus: 'Stopped', // Default status on creation
      pagePaths,
      IDparent,
      IDclick,
      htmlContentA,
      htmlContentB,
      createdBy: req.session.userId
    });
    console.log(`A/B test created: ${newTest.testName}`);
    res.redirect('/tests/management');
  } catch (error) {
    console.error('Error creating A/B test:', error.message, error.stack);
    res.status(500).send('Error creating A/B test.');
  }
});

// Starting or stopping an A/B test
router.post('/tests/:testId/toggle-status', isAuthenticated, async (req, res) => {
  try {
    const test = await AbTest.findById(req.params.testId);
    if (!test) {
      console.log('Test not found with id:', req.params.testId);
      return res.status(404).json({ success: false, message: 'Test not found.' });
    }
    test.testStatus = test.testStatus === 'Running' ? 'Stopped' : 'Running';
    await test.save();
    console.log(`Test status toggled: ${test.testName} is now ${test.testStatus}`);
    res.json({ success: true, testStatus: test.testStatus });
  } catch (error) {
    console.error('Error toggling test status:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Error toggling test status.' });
  }
});

// Updating an A/B test
router.post('/tests/:testId/update', isAuthenticated, async (req, res) => {
  try {
    const { testId } = req.params;
    const { testName, pagePaths, IDparent, IDclick, htmlContentA, htmlContentB, testStatus } = req.body;
    const test = await AbTest.findById(testId);
    if (!test) {
      console.log('Test not found with id:', testId);
      return res.status(404).send('Test not found.');
    }

    test.testName = testName;
    test.pagePaths = pagePaths;
    test.IDparent = IDparent;
    test.IDclick = IDclick;
    test.htmlContentA = htmlContentA;
    test.htmlContentB = htmlContentB;
    test.testStatus = testStatus;

    await test.save();
    console.log(`A/B test updated: ${test.testName}`);
    res.redirect('/tests/management');
  } catch (error) {
    console.error('Error updating A/B test:', error.message, error.stack);
    res.status(500).send('Error updating A/B test.');
  }
});

// Fetching results for an A/B test and displaying them on a separate page
router.get('/tests/:testId/results', isAuthenticated, async (req, res) => {
  try {
    const test = await AbTest.findById(req.params.testId);
    if (!test) {
      console.log(`A/B Test not found with ID: ${req.params.testId}`);
      return res.status(404).send('A/B Test not found');
    }
    console.log(`Rendering results for A/B Test: ${test.testName}`);
    res.render('testResults', { testName: test.testName, clicksA: test.clicksA, clicksB: test.clicksB, impressionsA: test.impressionsA, impressionsB: test.impressionsB });
  } catch (error) {
    console.error(`Error rendering results for A/B Test: ${error.message}`, error.stack);
    res.status(500).send('Internal server error while rendering A/B test results.');
  }
});

module.exports = router;