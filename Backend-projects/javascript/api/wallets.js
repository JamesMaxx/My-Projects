const mongoose = require('mongoose');
const Wallet = require('../server/models/wallet');
const Transaction = require('../server/models/transaction');
const jwt = require('jsonwebtoken');

async function ensureDb() {
  if (mongoose.connection.readyState === 0) {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance_db';
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  }
}

function getUserFromAuthHeader(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    return payload.id;
  } catch (err) {
    return null;
  }
}

module.exports = async function (req, res) {
  await ensureDb();
  const userId = getUserFromAuthHeader(req);
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { method } = req;
  if (method === 'GET') {
    // list wallets
    const wallets = await Wallet.find({ userId });
    return res.json(wallets);
  }
  if (method === 'POST') {
    const { name, purpose, currency } = req.body;
    const wallet = new Wallet({ userId, name, purpose, currency });
    await wallet.save();
    return res.json(wallet);
  }
  res.status(405).json({ message: 'Method not allowed' });
};
