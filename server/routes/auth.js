const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dbUsers = require('../database_users');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_widgetry_key';

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const existingUser = dbUsers.getByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = await dbUsers.create({ email, password });

    // Sign JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    res.status(201).json({
      token,
      user: newUser,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = dbUsers.getByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Sign JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = dbUsers.getById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      id: user.id,
      email: user.email,
      profilePic: user.profilePic || '',
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching user profile' });
  }
});

// @route   PUT /api/auth/me
// @desc    Update user profile details (email, password, profilePic)
router.put('/me', authMiddleware, async (req, res) => {
  const { email, password, profilePic } = req.body;
  try {
    const updateData = {};
    if (email) {
      const existing = dbUsers.getByEmail(email);
      if (existing && existing.id !== req.user.id) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      updateData.email = email;
    }
    if (profilePic !== undefined) {
      updateData.profilePic = profilePic;
    }
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      updateData.password = password;
    }

    const updatedUser = await dbUsers.update(req.user.id, updateData);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic || '',
      createdAt: updatedUser.createdAt,
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

module.exports = router;
