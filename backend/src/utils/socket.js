const jwt = require('jsonwebtoken');
const User = require('../models/User');

const onlineUsers = new Map();

const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Token gerekli'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('Kullanıcı bulunamadı'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Kimlik doğrulama hatası'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);
    socket.join(`user_${userId}`);
    console.log(`🔌 Kullanıcı bağlandı: ${socket.user.name}`);

    io.emit('user_online', { userId, online: true });

    socket.on('join_conversation', (conversationId) => {
      socket.join(`conv_${conversationId}`);
    });

    socket.on('send_message', async (data) => {
      io.to(`conv_${data.conversationId}`).emit('new_message', data);
    });

    socket.on('typing', (data) => {
      socket.to(`conv_${data.conversationId}`).emit('typing', {
        userId,
        conversationId: data.conversationId,
        isTyping: data.isTyping,
      });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('user_online', { userId, online: false });
      console.log(`🔌 Kullanıcı ayrıldı: ${socket.user.name}`);
    });
  });
};

module.exports = initSocket;
module.exports.onlineUsers = onlineUsers;
