const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// SETUP ROUTE: Create a new Admin (e.g., admin1, admin2)
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Check if admin already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Admin already exists" });

    // 2. Scramble (Hash) the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Save to MongoDB
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Admin created successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Find the admin
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Admin not found" });

    // 2. Check the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ message: "Login successful", username: user.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;