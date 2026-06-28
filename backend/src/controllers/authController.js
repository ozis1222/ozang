const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      wallet: user.wallet,
      isEmailVerified: user.isEmailVerified,
    },
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, message: 'Bu e-posta adresi zaten kayıtlı' });
    }
    const user = await User.create({ name, email, password });
    const verifyToken = user.getEmailVerificationToken();
    await user.save();
    const url = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
    try {
      await sendEmail({
        to: email,
        subject: 'E-posta adresinizi doğrulayın',
        html: `<h2>Merhaba ${name}!</h2><p>Hesabınızı doğrulamak için <a href="${url}">tıklayın</a>.</p>`,
      });
    } catch (e) { console.error('Email gönderilemedi:', e.message); }
    sendToken(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'E-posta ve şifre gerekli' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Geçersiz e-posta veya şifre' });
    }
    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Hesabınız askıya alınmıştır' });
    }
    user.lastLogin = new Date();
    await user.save();
    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.logout = (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.json({ success: true, message: 'Çıkış yapıldı' });
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).populate('followingStores', 'name logo slug');
  res.json({ success: true, user });
};

exports.verifyEmail = async (req, res) => {
  try {
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ emailVerificationToken: token, emailVerificationExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Geçersiz veya süresi dolmuş token' });
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();
    res.json({ success: true, message: 'E-posta başarıyla doğrulandı' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: 'Bu e-posta adresi kayıtlı değil' });
    const resetToken = user.getResetPasswordToken();
    await user.save();
    const url = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Şifre Sıfırlama',
      html: `<p>Şifrenizi sıfırlamak için <a href="${url}">tıklayın</a>. Bu link 30 dakika geçerlidir.</p>`,
    });
    res.json({ success: true, message: 'Şifre sıfırlama e-postası gönderildi' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Geçersiz veya süresi dolmuş token' });
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.googleCallback = async (req, res) => {
  const token = req.user.getSignedJwtToken();
  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
};
