const mongoose = require("mongoose")
const messageSchema = new mongoose.Schema({
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    message: { type: String, required: true },
    roomId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Every read of this collection is "the messages of one room, in time order":
// opening a thread, and the conversation-list aggregation that picks the most
// recent message per room. Without an index each of those was a full collection
// scan, and the Messages page ran one such scan per conversation.
messageSchema.index({ roomId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
