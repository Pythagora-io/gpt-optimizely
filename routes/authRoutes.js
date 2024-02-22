const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const router = express.Router();

router.get('/auth/register', (req, res) => {
  res.render('register', { error: '' });
});

router.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('Username already exists:', username);
      return res.render('register', { error: 'Username already exists.' });
    }
    await User.create({ username, password });
    console.log('User registered successfully:', username);
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error.message, error.stack);
    res.render('register', { error: error.message });
  }
});

router.get('/auth/login', (req, res) => {
  res.render('login', { error: '' });
});

router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found:', username);
      return res.render('login', { error: 'Invalid username or password.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.session.userId = user._id;
      console.log('User logged in successfully:', username);
      return res.redirect('/');
    } else {
      console.log('Password is incorrect for user:', username);
      return res.render('login', { error: 'Invalid username or password.' });
    }
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    res.render('login', { error: error.message });
  }
});

router.get('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error during session destruction:', err.message, err.stack);
      return res.status(500).send('Error logging out');
    }
    console.log('User logged out successfully');
    res.redirect('/auth/login');
  });
});

module.exports = router;