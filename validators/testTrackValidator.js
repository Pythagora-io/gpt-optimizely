const Joi = require('joi');

const testTrackSchema = Joi.object({
  apiKey: Joi.string().required(),
  version: Joi.string().valid('A', 'B').required(),
  clicked: Joi.boolean().required(),
  testName: Joi.string().required(),
  pagePath: Joi.string().required()
});

module.exports = {
  testTrackSchema
};