const Notification = require('../models/Notification');

const createNotification = async (io, { userId, type, title, message, link, data }) => {
  const notification = await Notification.create({ user: userId, type, title, message, link, data });
  if (io) {
    io.to(`user_${userId}`).emit('new_notification', notification);
  }
  return notification;
};

module.exports = { createNotification };
