const express = require('express');
const AbTest = require('../models/AbTest');
const User = require('../models/User');
const router = express.Router();

router.get('/api/generate-snippet', async (req, res) => {
  const { apiKey } = req.query;
  if (!apiKey) {
    console.error('API key query parameter is missing.');
    return res.status(400).send('API key is required.');
  }

  try {
    const user = await User.findOne({ apiKey });
    if (!user) {
      console.error(`Invalid API key: ${apiKey}`);
      return res.status(404).send('Invalid API key.');
    }

    const snippet = `<script src="${process.env.LOADER_JS_PATH}" data-api-key="${apiKey}"></script>`;
    console.log(`Snippet generated for API key: ${apiKey}`);
    res.type('text/plain').send(snippet);
  } catch (error) {
    console.error('Error generating snippet:', error.message, error.stack);
    res.status(500).send('Internal server error while generating snippet.');
  }
});

router.get('/api/tests/config', async (req, res) => {
  const { apiKey, path } = req.query;

  if (!apiKey || !path) {
    console.error('Missing API key or path query parameters.');
    return res.status(400).send('Missing API key or path.');
  }

  try {
    const user = await User.findOne({ apiKey });
    if (!user) {
      console.error(`Invalid API key: ${apiKey}`);
      return res.status(404).send('Invalid API key.');
    }

    const tests = await AbTest.find({
      createdBy: user._id,
      pagePaths: path,
      testStatus: 'Running'
    });

    if (tests.length === 0) {
      console.log('No running A/B tests found for this path.');
      return res.status(404).send('No running A/B tests found for this path.');
    }

    const testConfigs = tests.map(test => {
      // Randomly decide whether to serve version A or B for each test
      const version = Math.random() < 0.5 ? 'A' : 'B';
      const htmlContent = version === 'A' ? test.htmlContentA : test.htmlContentB;

      return {
        testName: test.testName,
        idParent: test.IDparent,
        idClick: test.IDclick,
        htmlContent: htmlContent,
        version: version
      };
    });

    console.log(`Serving configurations for ${testConfigs.length} running tests on path '${path}'.`);
    res.json(testConfigs);
  } catch (error) {
    console.error('Error fetching A/B test configuration:', error.message, error.stack);
    res.status(500).send('Internal server error while fetching A/B test configuration.');
  }
});

module.exports = router;