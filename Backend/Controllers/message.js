const Message = require("../Model/message");

const THREAD_LIMIT = 500;

exports.messagePost=async(req,res)=>{
    try {
        const { senderId,receiverId, message, roomId } = req.body;
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message,
            roomId
        })
      return  res.status(201).json(newMessage);
    } catch (error) {
        return  res.status(400).json({ message: error.message });
    }
}

exports.getMessageRoomId=async(req,res)=>{
    try {
        const messages = await Message.find({ roomId: req.params.roomId })
          .select("message senderId createdAt")
          .sort({ createdAt: -1 })
          .limit(THREAD_LIMIT)
          .lean();
       return res.json(messages.reverse());
      } catch (error) {
       return res.status(500).json({ message: error.message });
      }
}

exports.getAllMessage=async(req,res)=>{
    try {
        const messages = await Message.find()
          .select("message senderId roomId createdAt")
          .sort({ createdAt: -1 })
          .limit(THREAD_LIMIT)
          .lean();
      return  res.json(messages);
      } catch (error) {
       return res.status(500).json({ message: error.message });
      }
}
