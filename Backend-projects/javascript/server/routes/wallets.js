const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Wallet = require('../models/wallet');
const Transaction = require('../models/transaction');
const auth = require('../middleware/auth');

// Create wallet
router.post('/', auth, asyncHandler(async (req, res) => {
  const { name, purpose, currency } = req.body;
  const wallet = new Wallet({ userId: req.user._id, name, purpose, currency });
  await wallet.save();
  res.json(wallet);
}));

// Get wallets for user
router.get('/', auth, asyncHandler(async (req, res) => {
  const wallets = await Wallet.find({ userId: req.user._id });
  res.json(wallets);
}));

// Get wallet by id with transactions
router.get('/:id', auth, asyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({ _id: req.params.id, userId: req.user._id });
  if (!wallet) return res.status(404).json({ message: 'Not found' });
  const transactions = await Transaction.find({ walletId: wallet._id }).sort({ date: -1 });
  res.json({ wallet, transactions });
}));

// Add transaction to wallet
router.post('/:id/transactions', auth, asyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({ _id: req.params.id, userId: req.user._id });
  if (!wallet) return res.status(404).json({ message: 'Not found' });
  const { amount, type, category, notes } = req.body;
  const tx = new Transaction({ userId: req.user._id, walletId: wallet._id, amount, type, category, notes });
  await tx.save();
  // update wallet balance
  wallet.balance = (type === 'credit') ? wallet.balance + amount : wallet.balance - amount;
  await wallet.save();
  res.json(tx);
}));

module.exports = router;
