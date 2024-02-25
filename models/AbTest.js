const mongoose = require('mongoose');

const abTestSchema = new mongoose.Schema({
  testName: { type: String, required: true },
  testStatus: { type: String, required: true, enum: ['Running', 'Stopped'] },
  pagePaths: [{ type: String }],
  IDparent: { type: String, required: true },
  IDclick: { type: String, required: true },
  htmlContentA: { type: String, required: true },
  htmlContentB: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clicksA: { type: Number, default: 0 },
  clicksB: { type: Number, default: 0 },
  impressionsA: { type: Number, default: 0 },
  impressionsB: { type: Number, default: 0 }
}, { timestamps: true });

abTestSchema.pre('save', function(next) {
  console.log(`Saving A/B Test: ${this.testName}`);
  next();
});

abTestSchema.post('save', function(doc, next) {
  console.log(`A/B Test saved: ${doc.testName}`);
  next();
});

abTestSchema.post('save', function(error, doc, next) {
  if (error) {
    console.error(`Error saving A/B Test: ${error.message}`, error.stack);
    next(error);
  } else {
    next();
  }
});

const AbTest = mongoose.model('AbTest', abTestSchema);

module.exports = AbTest;