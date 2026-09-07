const mongoose = require("mongoose");
const join_room = require("../Model/joinRoomId");
const Message = require("../Model/message");
const ProductAdd = require("../Model/productAddForm");
const User = require("../Model/user");

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

/**
 * The signed-in user's conversation list, assembled server-side.
 *
 * The Messages page used to build this in the browser: it downloaded *every*
 * room in the database, filtered them locally, then walked the result in a
 * `for` loop awaiting three requests per room - the product, the room's entire
 * message history, and the other participant. That is 1 + 3N round trips issued
 * strictly in series, so ten conversations meant waiting for thirty-one
 * sequential requests before anything appeared on screen. It also pulled down
 * every message of every chat purely to render a one-line preview.
 *
 * Here the rooms come from one indexed query, the last message of every room
 * comes from a single aggregation over all of them at once, and the products
 * and the other participants are two bulk lookups that run concurrently. The
 * client makes one request and receives only the fields it renders.
 */
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const rooms = await join_room.find({ users: userId }).lean();
    if (!rooms.length) {
      return res.status(200).json({ success: true, count: 0, conversations: [] });
    }

    // Message.roomId is stored as a string, so the room ids have to be cast
    // before they can be matched against it.
    const roomIds = rooms.map((room) => String(room._id));

    // $sort feeds $group, so $first is the newest message of each room. One
    // pass replaces the old per-room history download.
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

    // Rooms with no messages were skipped by the old client too - a room is
    // created as soon as someone opens a product chat, before anyone speaks.
    const active = rooms.filter((room) => summaryByRoom.has(String(room._id)));
    if (!active.length) {
      return res.status(200).json({ success: true, count: 0, conversations: [] });
    }

    // A room's `users` array is [initiatorId, ownerId, productId]; see
    // joinRoomIdPost. Anything that is not a valid id is dropped rather than
    // handed to Mongo, which would reject the whole query with a CastError.
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
        // The product has since been deleted. The old client dropped these
        // rooms as well, by way of the product request throwing.
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
          // Ordered by real activity. The old list sorted on room.updatedAt,
          // which only changes when the room document itself is written - never
          // when a message is sent - so the ordering was effectively arbitrary.
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
