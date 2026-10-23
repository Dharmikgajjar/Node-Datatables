const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const sign = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });


router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await User.create({ name, email, password, address, phone });
    res.status(201).json({
      token: sign(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
});


router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json({
      token: sign(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
});


router.get('/me', protect, (req, res) => res.json(req.user));

module.exports = router;
