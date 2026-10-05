const mongoose = require("mongoose");
const join_room = require("../Model/joinRoomId");
const Message = require("../Model/message");
const ProductAdd = require("../Model/productAddForm");
const User = require("../Model/user");

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const rooms = await join_room.find({ users: userId }).lean();
    if (!rooms.length) {
      return res.status(200).json({ success: true, count: 0, conversations: [] });
    }

    const roomIds = rooms.map((room) => String(room._id));

    const summaries = await Message.aggregate([
      { $match: { roomId: { $in: roomIds } } },
      { $sort: { roomId: 1, createdAt: -1 } },
      {
        $group: {
          _id: "$roomId",
          lastMessage: { $first: "$message" },
          lastMessageAt: { $first: "$createdAt" },
          lastSenderId: { $first: "$senderId" },
          messageCount: { $sum: 1 },
        },
      },
    ]);

    const summaryByRoom = new Map(summaries.map((row) => [String(row._id), row]));

    const active = rooms.filter((room) => summaryByRoom.has(String(room._id)));
    if (!active.length) {
      return res.status(200).json({ success: true, count: 0, conversations: [] });
    }

    const validId = (value) => (mongoose.isValidObjectId(value) ? String(value) : null);
    const otherIdOf = (room) => (room.users?.[0] === userId ? room.users?.[1] : room.users?.[0]);

    const productIds = [...new Set(active.map((room) => validId(room.users?.[2])).filter(Boolean))];
    const otherUserIds = [...new Set(active.map((room) => validId(otherIdOf(room))).filter(Boolean))];

    const [products, others] = await Promise.all([
      ProductAdd.find({ _id: { $in: productIds } })
        .select("name image newAmount prevAmount category")
        .lean(),
      User.find({ _id: { $in: otherUserIds } }).select("name profileImage").lean(),
    ]);

    const productById = new Map(products.map((product) => [String(product._id), product]));
    const userById = new Map(others.map((user) => [String(user._id), user]));

    const conversations = active
      .map((room) => {
        const summary = summaryByRoom.get(String(room._id));
        const product = productById.get(String(room.users?.[2]));
        if (!product) return null;

        const isInitiator = room.users?.[0] === userId;
        const otherUserId = otherIdOf(room) ?? null;
        const other = userById.get(String(otherUserId));

        return {
          roomId: String(room._id),
          product,
          lastMessage: summary.lastMessage ?? "",
          lastSenderId: summary.lastSenderId ?? null,
          messageCount: summary.messageCount,
          otherUserId,
          otherUserName: other?.name || (isInitiator ? "Recipient" : "Sender"),
          otherUserAvatar: other?.profileImage || DEFAULT_AVATAR,
          timestamp: summary.lastMessageAt ?? room.updatedAt ?? room.createdAt,
          unread: 0,
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.status(200).json({ success: true, count: conversations.length, conversations });
  } catch (error) {
    console.error("Get conversations error:", error);
    return res.status(500).json({ success: false, message: "Error fetching conversations" });
  }
};
