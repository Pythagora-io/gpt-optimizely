const express = require('express');
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

module.exports = router;