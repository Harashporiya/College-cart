const mongoose = require("mongoose")
const messageSchema = new mongoose.Schema({
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    message: { type: String, required: true },
    roomId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

messageSchema.index({ roomId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
