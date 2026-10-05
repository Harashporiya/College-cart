const express = require("express");
const { messagePost, getAllMessage, getMessageRoomId } = require("../Controllers/message");
const { getConversations } = require("../Controllers/conversation");
const { isAuthenticated } = require("../middleware/auth");
const router = express.Router();

router.post("/message", messagePost)
router.get("/message/:roomId",getMessageRoomId )
router.get("/messages", isAuthenticated, getAllMessage )
router.get("/conversations", isAuthenticated, getConversations)

module.exports = router;
