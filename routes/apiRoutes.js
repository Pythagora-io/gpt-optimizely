const express = require('express');
const AbTest = require('../models/AbTest');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');
const { testTrackSchema } = require('../validators/testTrackValidator');
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

    let tests = await AbTest.find({
      createdBy: user._id,
      pagePaths: path,
      testStatus: 'Running'
    });

    if (tests.length === 0) {
      console.log('No running A/B tests found for this path.');
      return res.status(404).send('No running A/B tests found for this path.');
    }

    // Create a map of child to parent
    const childToParentMap = {};
    tests.forEach(test => {
      childToParentMap[test.testName] = tests.find(t => t.htmlContentA.includes(test.IDparent) || t.htmlContentB.includes(test.IDparent))?.testName || null;
    });

    // Function to recursively find the order
    const getOrder = (testName, visited = new Set(), result = []) => {
      visited.add(testName);
      const parent = childToParentMap[testName];
      if (parent && !visited.has(parent)) {
        getOrder(parent, visited, result);
      }
      result.push(testName);
      return result;
    };

    // Get the order for all tests, filtering out duplicates
    const order = [...new Set(tests.map(test => getOrder(test.testName)).flat())];

    // Re-order tests based on the calculated order
    tests.sort((a, b) => order.indexOf(a.testName) - order.indexOf(b.testName));

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

    console.log(`Serving sorted configurations for ${testConfigs.length} tests on path '${path}' with correct parent-child order.`);
    res.json(testConfigs);
  } catch (error) {
    console.error('Error fetching and sorting A/B test configuration:', error.message, error.stack);
    res.status(500).send('Internal server error while fetching and sorting A/B test configuration.');
  }
});

// Define a simple rate limit rule: Allow 100 requests per hour per IP
const trackApiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: 'Too many requests from this IP, please try again after an hour'
});

// Add a new route for tracking clicks
router.post('/api/tests/track', trackApiLimiter, async (req, res) => {
  const validation = testTrackSchema.validate(req.body);
  if (validation.error) {
    console.error('Validation error:', validation.error.message);
    return res.status(400).send('Validation error: ' + validation.error.message);
  }

  const { apiKey, version, clicked, testName, pagePath } = req.body;

  try {
    const user = await User.findOne({ apiKey });
    if (!user) {
      console.error(`Invalid API key: ${apiKey}`);
      return res.status(404).send('Invalid API key.');
    }

    const filter = { createdBy: user._id, testName: testName, pagePaths: pagePath, testStatus: 'Running' };
    const update = version === 'A' ? { $inc: { clicksA: 1 } } : { $inc: { clicksB: 1 } };

    const test = await AbTest.findOneAndUpdate(filter, update, { new: true });

    if (!test) {
      console.error('A/B Test not found or not running on specified path.');
      return res.status(404).send('A/B Test not found or not running on specified path.');
    }

    console.log(`Click for ${testName} tracked successfully.`);
    res.status(200).send('Click tracked successfully.');
  } catch (error) {
    console.error('Error tracking A/B test click:', error.message, error.stack);
    res.status(500).send('Error tracking A/B test click.');
  }
});

// Add a new route for tracking impressions
router.post('/api/tests/impression', trackApiLimiter, async (req, res) => {
  const { apiKey, version, testName, pagePath } = req.body;

  try {
    const user = await User.findOne({ apiKey });
    if (!user) {
      console.error(`Invalid API key: ${apiKey}`);
      return res.status(404).send('Invalid API key.');
    }

    const filter = { createdBy: user._id, testName: testName, pagePaths: pagePath, testStatus: 'Running' };
    const update = version === 'A' ? { $inc: { impressionsA: 1 } } : { $inc: { impressionsB: 1 } };

    const test = await AbTest.findOneAndUpdate(filter, update, { new: true });

    if (!test) {
      console.error('A/B Test not found or not running on specified path for impression tracking.');
      return res.status(404).send('A/B Test not found or not running on specified path for impression tracking.');
    }

    console.log(`Impression for ${testName} tracked successfully.`);
    res.status(200).send('Impression tracked successfully.');
  } catch (error) {
    console.error('Error tracking A/B test impression:', error.message, error.stack);
    res.status(500).send('Error tracking A/B test impression.');
  }
});

module.exports = router;
