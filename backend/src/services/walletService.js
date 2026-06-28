const User = require('../models/User');
const Transaction = require('../models/Transaction');

const credit = async (userId, amount, description, meta = {}) => {
  const user = await User.findById(userId);
  const balanceBefore = user.wallet;
  user.wallet += amount;
  await user.save();
  await Transaction.create({
    user: userId,
    type: meta.type || 'deposit',
    amount,
    balanceBefore,
    balanceAfter: user.wallet,
    description,
    ...meta,
  });
  return user.wallet;
};

const debit = async (userId, amount, description, meta = {}) => {
  const user = await User.findById(userId);
  if (user.wallet < amount) throw new Error('Yetersiz bakiye');
  const balanceBefore = user.wallet;
  user.wallet -= amount;
  await user.save();
  await Transaction.create({
    user: userId,
    type: meta.type || 'withdrawal',
    amount: -amount,
    balanceBefore,
    balanceAfter: user.wallet,
    description,
    ...meta,
  });
  return user.wallet;
};

module.exports = { credit, debit };
