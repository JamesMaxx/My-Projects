const mongoose = require('mongoose');
const User = require('../server/models/user');
const jwt = require('jsonwebtoken');

// Vercel serverless handler for user login/register minimal example
module.exports = async function (req, res) {
  // ensure mongoose connection
  if (mongoose.connection.readyState === 0) {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance_db';
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  }

  const { method } = req;
  if (method === 'POST') {
    const { action } = req.query;
    if (action === 'register') {
      const { email, password, name } = req.body;
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'User exists' });
      const bcrypt = require('bcrypt');
      const hash = await bcrypt.hash(password, 10);
      const user = new User({ email, name, passwordHash: hash });
      await user.save();
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      return res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
    }
    if (action === 'login') {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });
      const ok = await user.verifyPassword(password);
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      return res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
    }
  }
  res.status(404).json({ message: 'Not found' });
};
