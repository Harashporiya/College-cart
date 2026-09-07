const express = require("express");
const { messagePost, getAllMessage, getMessageRoomId } = require("../Controllers/message");
const { getConversations } = require("../Controllers/conversation");
const { isAuthenticated } = require("../middleware/auth");
const router = express.Router();

router.post("/message", messagePost)
router.get("/message/:roomId",getMessageRoomId )
// Kept for compatibility, but no longer readable without a session.
router.get("/messages", isAuthenticated, getAllMessage )
// Replaces the client-side conversation-list waterfall in Messages.jsx.
router.get("/conversations", isAuthenticated, getConversations)

module.exports = router;
