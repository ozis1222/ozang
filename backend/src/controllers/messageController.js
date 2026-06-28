const { Conversation, Message } = require('../models/Message');
const { createNotification } = require('../services/notificationService');

exports.getConversations = async (req, res) => {
  try {
    const convs = await Conversation.find({ participants: req.user.id })
      .populate('participants', 'name avatar')
      .populate('lastMessage')
      .populate('product', 'title images price')
      .sort('-lastMessageAt');
    res.json({ success: true, conversations: convs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrCreateConversation = async (req, res) => {
  try {
    const { participantId, productId } = req.body;
    if (participantId === req.user.id) {
      return res.status(400).json({ success: false, message: 'Kendinize mesaj gönderemezsiniz' });
    }

    let conv = await Conversation.findOne({
      participants: { $all: [req.user.id, participantId] },
      ...(productId ? { product: productId } : {}),
    }).populate('participants', 'name avatar').populate('product', 'title images price');

    if (!conv) {
      conv = await Conversation.create({
        participants: [req.user.id, participantId],
        product: productId || undefined,
      });
      conv = await conv.populate('participants', 'name avatar');
      if (productId) conv = await conv.populate('product', 'title images price');
    }
    res.json({ success: true, conversation: conv });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv || !conv.participants.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Erişim yetkiniz yok' });
    }

    const { page = 1, limit = 50 } = req.query;
    const total = await Message.countDocuments({ conversation: req.params.id, isDeleted: false });
    const messages = await Message.find({ conversation: req.params.id, isDeleted: false })
      .populate('sender', 'name avatar')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    await Message.updateMany(
      { conversation: req.params.id, sender: { $ne: req.user.id }, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    const unread = conv.unreadCount || {};
    unread.set ? unread.set(req.user.id.toString(), 0) : (unread[req.user.id] = 0);
    conv.unreadCount = unread;
    await conv.save();

    res.json({ success: true, messages: messages.reverse(), total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv || !conv.participants.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Erişim yetkiniz yok' });
    }

    const msg = await Message.create({
      conversation: req.params.id,
      sender: req.user.id,
      content: req.body.content,
      type: req.body.type || 'text',
      offerData: req.body.offerData,
    });

    await msg.populate('sender', 'name avatar');

    conv.lastMessage = msg._id;
    conv.lastMessageAt = new Date();
    const otherUserId = conv.participants.find(p => p.toString() !== req.user.id).toString();
    const unread = conv.unreadCount instanceof Map ? conv.unreadCount : new Map(Object.entries(conv.unreadCount || {}));
    unread.set(otherUserId, (unread.get(otherUserId) || 0) + 1);
    conv.unreadCount = unread;
    await conv.save();

    req.app.get('io').to(`conv_${req.params.id}`).emit('new_message', msg);

    await createNotification(req.app.get('io'), {
      userId: otherUserId,
      type: 'new_message',
      title: 'Yeni Mesaj',
      message: `${req.user.name}: ${msg.content.substring(0, 50)}`,
      link: `/messages/${req.params.id}`,
    });

    res.status(201).json({ success: true, message: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
