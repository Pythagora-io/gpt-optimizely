const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const router = express.Router();

router.get('/auth/register', (req, res) => {
  res.render('register', { error: '' });
});

router.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Email already exists:', email);
      return res.render('register', { error: 'Email already exists.' });
    }
    const user = new User({ email, password });
    await user.save();
    console.log('User registered successfully:', email);
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error.message, error.stack);
    res.render('register', { error: 'Error during registration' });
  }
});

router.get('/auth/login', (req, res) => {
  res.render('login', { error: '' });
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.render('login', { error: 'Invalid email or password.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password is incorrect for user:', email);
      return res.render('login', { error: 'Invalid email or password.' });
    }
    req.session.userId = user._id;
    console.log('User logged in successfully:', email);
    res.redirect('/');
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    res.render('login', { error: 'Error during login' });
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