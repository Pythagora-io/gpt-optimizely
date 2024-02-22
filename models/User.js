const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  apiKey: { type: String, unique: true }
});

// Pre-save middleware for generating the API key and hashing the password
userSchema.pre('save', async function(next) {
  const user = this;

  // Generating the API key
  if (user.isNew) {
    try {
      user.apiKey = uuidv4(); // Generate a unique API key
      console.log(`API Key generated for user: ${user.username}`);
    } catch (err) {
      console.error('Error generating API key:', err.message, err.stack);
      return next(err);
    }
  }

  // Hashing the password
  if (user.isModified('password')) {
    try {
      const hash = await bcrypt.hash(user.password, 10);
      user.password = hash;
      console.log(`Password hashed for user: ${user.username}`);
    } catch (err) {
      console.error('Error hashing password:', err.message, err.stack);
      return next(err);
    }
  }

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;