// routes/Registration.js

const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Route to handle user registration
router.post('/', async (req, res) => {
  const { name, email, dob, gender, contact, username, password } = req.body;

  try {
    // Check if email or username already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with that email or username' });
    }

    // Create new user with hashed password
    const newUser = new User({
      name,
      email,
      dob,
      gender,
      contact,
      username,
      password, // Make sure to hash password before storing it
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
